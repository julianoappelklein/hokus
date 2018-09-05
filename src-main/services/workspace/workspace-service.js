// @flow

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { nativeImage } = require('electron');
const formatProviderResolver = require('./../../format-provider-resolver');
const WorkspaceConfigValidator = require('./workspace-config-validator'); 
const contentFormats = require('./../../content-formats'); 
const { promisify } = require('util');
const mainWindowManager = require('./../../main-window-manager');
const Jimp = require("jimp");
const { createThumbnailJob } = require('./../../jobs');

class WorkspaceService{
    constructor(workspacePath /* : string */){
        this.workspacePath = workspacePath;
    }

    /*:: workspacePath : string; */

    //Get the workspace configurations data to be used by the client
    getConfigurationsData(){
        let fileExp = path.join(this.workspacePath,'hokus.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
        let filePath = glob.sync(fileExp)[0];
        let parsedData;
        let formatProvider;
        if(!filePath){
            parsedData = require('./default-workspace-config.json');
            formatProvider = formatProviderResolver.getDefaultFormat();
            let dump = formatProvider.dump(parsedData);
            fs.writeFileSync(
                path.join(this.workspacePath,'hokus.'+formatProvider.defaultExt()), 
                dump
            );
        }
        else{
            let strData = fs.readFileSync(filePath,'utf8');
            formatProvider = formatProviderResolver.resolveForFilePath(filePath);
            parsedData = formatProvider.parse(strData);
        }
        
        let result = (new WorkspaceConfigValidator()).validate(parsedData);
        if(result)
            throw new Error(result);

        return parsedData;
    }

    async _smartResolveFormatProvider(filePath /* : string */, fallbacks /*: Array<string> */){
        let formatProvider;
        if(contentFormats.isContentFile(filePath)){
            if(fs.existsSync(filePath))
                formatProvider = await formatProviderResolver.resolveForMdFilePromise(filePath);
        }
        else
            formatProvider = formatProviderResolver.resolveForFilePath(filePath);         
        
        if(formatProvider)
            return formatProvider;
        
        if(fallbacks){
            for(let i = 0; i < fallbacks.length; i++){
                if(fallbacks[i]){
                    formatProvider = formatProviderResolver.resolveForExtension(fallbacks[i]);
                    if(formatProvider)
                        return formatProvider;
                }
            }
        }
        
        return undefined;
    }
    async _smartDump(filePath /* : string */, formatFallbacks  /*: Array<string> */, obj /* : any */){
        let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
        if(formatProvider===undefined)
            formatProvider = formatProviderResolver.getDefaultFormat();
        if(contentFormats.isContentFile(filePath)){
            return formatProvider.dumpContent(obj);
        }
        else{
            return formatProvider.dump(obj);
        }
    }

    async _smartParse(filePath /* : string */, formatFallbacks  /*: Array<string> */, str /* : string */){
        if(str===undefined||str===null||str.length===0||!/\S$/gi){
            return {};
        }
        let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
        if(formatProvider===undefined)
            throw new Error('Could not resolve a FormatProvider to parse.');
        if(contentFormats.isContentFile(filePath)){
            return formatProvider.parseFromMdFileString(str);
        }
        else{
            return formatProvider.parse(str);
        }
    }

    async getSingle(singleKey /* : string */){
        let config = this.getConfigurationsData();
        let single = config.singles.find(x => x.key === singleKey);
        let filePath = path.join(this.workspacePath, single.file);

        if(fs.existsSync(filePath)){
            let data = fs.readFileSync(filePath,'utf8');
            return await this._smartParse(filePath, [path.extname(single.file).replace('.','')], data);
        }
        else{
            return {};
        }
    }

    //Update the single
    async updateSingle(singleKey /* : string */, document /* : any */ ){
        let config = this.getConfigurationsData();
        let single = config.singles.find(x => x.key === singleKey);
        let filePath = path.join(this.workspacePath, single.file);

        let directory = path.dirname(filePath);
        
        if (!fs.existsSync(directory))
            fs.mkdirSync(directory);//ensure directory existence
                 
        this._stripNonDocumentData(document);
        
        let stringData = await this._smartDump(filePath, [path.extname(single.file).replace('.','')], document);
        fs.writeFileSync(filePath, stringData);
        return document;
    }

    async getResourcesFromContent(filePath/* : string */, currentResources /* : Array<any> */ = []){
        filePath = path.normalize(filePath);
        let directory = path.dirname(filePath);
        let globExp = '**/*';
        let allFiles = await promisify(glob)(globExp, {nodir:true, absolute:false, root:directory, cwd:directory });

        let expression = `_?index[.](${contentFormats.SUPPORTED_CONTENT_EXTENSIONS.join('|')})$`;
        let pageOrSectionIndexReg = new RegExp(expression);
        allFiles = allFiles.filter(x => !pageOrSectionIndexReg.test(x));
        
        let merged = allFiles.map(src =>{
            return Object.assign({ src }, currentResources.find(r => r.src===src));
        });
        return merged;
    }

    async getCollectionItem(collectionKey /* : string */, collectionItemKey /* : string */){

        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let keyExt = path.extname(collectionItemKey);
        let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
        if(await fs.exists(filePath)){
            let data = await fs.readFile(filePath,{encoding:'utf8'});
            let obj  = await this._smartParse(filePath, [collection.extension], data);
            if(contentFormats.isContentFile(filePath)){
                obj.resources = await this.getResourcesFromContent(filePath, obj.resources);
            }
            return obj;
        }
        else{
            return undefined;
        }
    }

    async createCollectionItemKey(collectionKey /* : string */,  collectionItemKey /* : string */){
        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let filePath;
        let returnedKey;
        if(collection.folder.startsWith('content')){
            returnedKey = path.join(collectionItemKey, 'index.'+collection.extension);
            filePath = path.join(this.workspacePath, collection.folder, returnedKey);
        }
        else{
            returnedKey = collectionItemKey + '.' + collection.extension;
            filePath = path.join(this.workspacePath, collection.folder, returnedKey);
        }
        if(fs.existsSync(filePath))
            return { unavailableReason:'already-exists' };

        await fs.ensureDir(path.dirname(filePath));
        let stringData = await this._smartDump(filePath, [collection.dataformat], collection.protodata||{});
        await fs.writeFile(filePath, stringData, {encoding:'utf8'});

        return { key: returnedKey.replace(/\\/g,'/') };
    }

    async listCollectionItems(collectionKey /* : string */){
        let collection = this.getConfigurationsData().collections.find(x => x.key === collectionKey);
        let folder = path.join(this.workspacePath, collection.folder).replace(/\\/g,'/');
        
        //TODO: make it more flexible! This should not be handled with IF ELSE.  But is good enough for now.

        if(collection.folder.startsWith('content')){
            let globExpression = path.join(folder, "*/index.{md,html,markdown}");
            return new Promise((resolve)=>{
                glob(globExpression, {}, (er, files)=>{
                    let result = files.map(function(item){
                        let key = item.replace(folder,'');
                        let label = key.replace(/^\/?(.+)\/[^\/]+$/,'$1');
                        return {key, label};
                    });
                    resolve(result);
                });
            });
        }
        else{ //data folder and everything else
            let globExpression = path.join(folder, "**/*.{json,yaml}");
            return glob.sync(globExpression).map(function(item){
                let key = item.replace(folder,'');
                return {key, label:key};
            });
        }
    }

    //Remove item from collection - remove from file system
    removeCollectionItem(collectionKey /* : string */, collectionItemKey /* : string */){
        let collection = this.getConfigurationsData().collections.find(x => x.key === collectionKey);
        let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
        if(!fs.existsSync(filePath))
            throw 'Cannot unlink file. It does not exists.';
        fs.unlinkSync(filePath);
    }

    _stripNonDocumentData(document /* : any */){
        for(var key in document){
            if(key.startsWith('__')){
                delete document[key];
            }
            if(document.resources){
                document.resources = document.resources.filter((x) => x.__deleted==true);
                document.resources.forEach((x)=>delete x.__deleted);
            }
        }
    }

    async renameCollectionItem(collectionKey /* : string */, collectionItemKey /* : string */, collectionItemNewKey /* : string */){
        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let filePath;
        let newFilePath;
        let newFileKey;
        if(collection.folder.startsWith('content')){
            filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
            newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey);
            newFileKey = path.join(collectionItemNewKey, 'index.'+collection.extension);
        }
        else{
            filePath = path.join(this.workspacePath, collection.folder, collectionItemKey + collection.extension);
            newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey + collection.extension);
            newFileKey = path.join(collectionItemNewKey+'.'+collection.extension);
        }

        if (!fs.existsSync(filePath)){
            return { renamed: false };
        }
        if (fs.existsSync(newFilePath)){
            return { renamed: false };
        }
        fs.renameSync(filePath, newFilePath);
        return { renamed: true, item: { key:newFileKey.replace(/\\/g,'/'), label:collectionItemNewKey }};
    }

    async deleteCollectionItem(collectionKey /* : string */, collectionItemKey /* : string */){
        //TODO: only work with "label" of a collection item
        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
        if (fs.existsSync(filePath)){
            //TODO: use async await with a promise to test if deletion succeded
            fs.unlink(filePath);
            return true;
        }
        return false;
    }

    async updateCollectionItem(collectionKey /* : string */ , collectionItemKey /* : string */, document /* : any */){
        //TODO: only work with "label" of a collection item
        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
        let directory = path.dirname(filePath);

        if (!fs.existsSync(directory))
            fs.mkdirSync(directory);//ensure directory existence

        let documentClone =  JSON.parse(JSON.stringify(document));
        this._stripNonDocumentData(documentClone);
        let stringData = await this._smartDump(filePath, [collection.dataformat], documentClone);
        fs.writeFileSync(filePath,stringData);

        //preparing return
        if(document.resources){
            for(let r = 0; r < document.resources.length; r++){
                let resource = document.resources[r];
                if(resource.__deleted){
                    let fullSrc = path.join(directory, resource.src);
                    await fs.remove(fullSrc);
                }
            }
            document.resources = document.resources.filter(x => x.__deleted!==true);
        }
        return document;
    }

    async removeFileFromCollectionItem(collectionKey /* : string */, collectionItemKey /* : string */, file /* : string */){

    }

    async copyFilesIntoCollectionItem(collectionKey /* : string */, collectionItemKey /* : string */, targetPath /* : string */, files /* : Array<string> */){
        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let pathFromItemRoot = path.join(collectionItemKey.replace(/\/[^\/]+$/,'') , targetPath);
        let filesBasePath = path.join(this.workspacePath, collection.folder, pathFromItemRoot);
        
        for(let i =0; i < files.length; i++){
            let file = files[i]
        
            let from = file;
            let to = path.join(filesBasePath, path.basename(file));

            let toExists = fs.existsSync(to);
            if(toExists){
                fs.unlinkSync(to);
            }

            await fs.copy(from, to);
        };
        
        return files.map(x => {
            return path.join(targetPath, path.basename(x)).replace(/\\/g,'/');
        });
    }

    existsPromise(src /* : string */){
        return new Promise((resolve)=>{
            fs.exists(src, (exists)=>{
                resolve(exists);
            });
        });
    }

    async getThumbnailForCollectionItemImage(collectionKey /* : string */, collectionItemKey /* : string */, targetPath /* : string */){
        
        let config = this.getConfigurationsData();
        let collection = config.collections.find(x => x.key === collectionKey);
        let itemPath = collectionItemKey.replace(/\/[^\/]+$/,'');
        let src = path.join(this.workspacePath, collection.folder, itemPath, targetPath);
        
        let srcExists = await this.existsPromise(src);
        if(!srcExists){
            return 'NOT_FOUND';
        }
        
        let thumbSrc = path.join(this.workspacePath, '.hokus/thumbs', collection.folder, itemPath, targetPath);
        let thumbSrcExists = await this.existsPromise(thumbSrc);
        if(!thumbSrcExists){
            try{
                let job = createThumbnailJob(src, thumbSrc);
                await job.run();
            }
            catch(e){
                return 'NOT_FOUND';
            }
        }

        let ext = path.extname(thumbSrc).replace('.','');
        let mime = `image/${ext}`;
        let buffer = await promisify(fs.readFile)(thumbSrc);
        let base64 = buffer.toString('base64');

        return `data:${mime};base64,${base64}`;
        
    }
}

module.exports = WorkspaceService;