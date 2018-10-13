/* @flow */

let {dialog, remote} = require('electron');
const configurationDataProvider = require('./configuration-data-provider')
const SiteService = require('./services/site/site-service')
const WorkspaceService = require('./services/workspace/workspace-service')
const siteSourceBuilderFactory = require('./site-sources/builders/site-source-builder-factory');
const hugoDownloader = require('./hugo/hugo-downloader')
const hugoThemes = require('./hugo/hugo-themes')
const opn = require('opn');
const pathHelper = require('./path-helper');
const fs = require('fs-extra');

/*::
type APIContext = {
    resolve: (data: any) => void,
    reject: (error: any) => void
}

type Callback = (error: any, data: any)=>void
type CallbackTyped<T> = (error: any, data: T)=>void
*/

let api/*: { [key: string]: ( payload: any, context: APIContext ) => void }*/ = {};

function getSiteService(siteKey, callback/*: CallbackTyped<SiteService>*/){
    configurationDataProvider.get(function(err, configurations){
        if(err){ callback(err, (null/*: any*/)); return; }
        let siteData = configurations.sites.find((x)=>x.key===siteKey);
        let siteService = new SiteService(siteData);
        callback(undefined, siteService);
    });
}

function getSiteServicePromise(siteKey, callback)/*: Promise<SiteService>*/{
    return new Promise((resolve, reject)=>{
        configurationDataProvider.get(function(err, configurations){
            if(err) { reject(err); return; } 
            let siteData = configurations.sites.find((x)=>x.key===siteKey);
            let siteService = new SiteService(siteData);
            resolve(siteService);
        });
    });
}

function getWorkspaceService(siteKey, workspaceKey, callback/*: CallbackTyped<{siteService: SiteService, workspaceService: WorkspaceService}>*/){
    getSiteService(siteKey, function(err, siteService){
        if(err){ callback(err, (null/*: any*/)); return; }
        let workspaceHead = siteService.getWorkspaceHead(workspaceKey);
        if(workspaceHead==null)
            throw new Error('Could not find workspace.');
        let workspaceService = new WorkspaceService(workspaceHead.path, workspaceHead.key, siteKey);
        callback(undefined, {siteService, workspaceService});
    });
}

function getWorkspaceServicePromise(siteKey, workspaceKey, callback){
    getSiteServicePromise(siteKey)
    .then((siteService)=>{
        let workspaceHead = siteService.getWorkspaceHead(workspaceKey);
        if(workspaceHead==null) return Promise.reject(new Error('Could not find workspace.'));
        else{
            let workspaceService = new WorkspaceService(workspaceHead.path, workspaceHead.key, siteKey);
            return { siteService, workspaceService };
        }
    })
    .catch((e)=>{
        return Promise.reject(e);
    });
}

api.getConfigurations = function(options, promise){
    configurationDataProvider.get(function(err, data){
        if(err)
            promise.reject(err);
        else
            promise.resolve(data);
    }, options);
}

api.openFileExplorer = function({path}, promise){
    try{
        let lstat = fs.lstatSync(path);
        if(lstat.isDirectory()){
            opn(path);
        }
    }
    catch(e){
    }
}

api.listWorkspaces = function({siteKey}, context){
    configurationDataProvider.get(function(err, configurations){
        if(err){ context.reject(err); return; }
        let siteData = configurations.sites.find((x)=>x.key===siteKey);
        let service = new SiteService(siteData);
        context.resolve(service.listWorkspaces());
    });
}

api.getWorkspaceDetails = function({siteKey, workspaceKey}, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        let configuration = workspaceService.getConfigurationsData();
        hugoDownloader.downloader.download(configuration.hugover);
        context.resolve(configuration);
    });
}

api.serveWorkspace = function({siteKey, workspaceKey, serveKey}, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.serve(serveKey).then(()=>{
            opn('http://localhost:1313');
            context.resolve();
        }, ()=>{
            context.reject(err); return
        });
    });
}

api.buildWorkspace = function({siteKey, workspaceKey, buildKey}, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.build(buildKey).then(()=>{
            context.resolve();
        }, ()=>{
            context.reject(err); return
        });
    });
}

api.getSingle = function({siteKey, workspaceKey, singleKey}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.getSingle(singleKey).then(r=>{
            context.resolve(r);
        });
    });
}

api.updateSingle = function({siteKey, workspaceKey, singleKey, document}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.updateSingle(singleKey, document).then(r=>{
            context.resolve(r);
        })
   });
}

api.listCollectionItems = function({siteKey, workspaceKey, collectionKey}, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.listCollectionItems(collectionKey)
        .then((result)=>{
            context.resolve(result)
        })
        .catch((error)=>{
            context.reject(error);
        });
   });
}

api.getCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.getCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{ 
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.createCollectionItemKey(collectionKey, collectionItemKey)
        .then((result)=>{ context.resolve(result); })
        .catch((error)=>{ context.reject(error); });
    });
}

api.updateCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, document}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.updateCollectionItem(collectionKey, collectionItemKey, document)
        .then((result)=>{ 
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.createCollectionItemKey(collectionKey, collectionItemKey)
        .then((result)=>{ 
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.copyFilesIntoCollectionItem  = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files }, context){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.copyFilesIntoCollectionItem(collectionKey, collectionItemKey, targetPath, files)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.deleteCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.deleteCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{
            context.resolve({deleted:result});
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.renameCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.renameCollectionItem(collectionKey, collectionItemKey, collectionItemNewKey)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.getThumbnailForCollectionItemImage = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}, promise){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.getThumbnailForCollectionItemImage(collectionKey, collectionItemKey, targetPath)
        .then((result)=>{
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.createSite = (config/*: any*/, context)=>{
    siteSourceBuilderFactory.get(config.sourceType).build(config).then(() =>{
        configurationDataProvider.invalidateCache();
        context.resolve();
    }, (err)=>{
        context.reject(err);
    });
}

api.publishSite = function({siteKey, publishKey}, context){
    getSiteService(siteKey, function(err, siteService){
        if(err){ context.reject(err); return; }
        siteService.publish(publishKey).then(()=>{
            context.resolve();
        }, ()=>{
            context.reject(err);
        });
    });
}

module.exports = api;