/* @flow */

const configurationDataProvider = require('./configuration-data-provider')
const SiteService = require('./services/site/site-service')
const WorkspaceService = require('./services/workspace/workspace-service')
const siteSourceBuilderFactory = require('./site-sources/builders/site-source-builder-factory');
const hugoDownloader = require('./hugo/hugo-downloader')
const fs = require('fs-extra');
const {dirname} = require('path');
const {shell} = require('electron');

/*::
type APIContext = {
    resolve: (data: any) => void,
    reject: (error: any) => void
}

type Callback = (error: any, data: any)=>void
type CallbackTyped<T> = (error: any, data: T)=>void
*/

let api/*: { [key: string]: ( payload: any, context: APIContext ) => (void|Promise<void>) }*/ = {};

function bindResponseToContext(promise/*: Promise<any>*/, context/*: any*/){
    promise.then((result)=>{
        context.resolve(result);
    }, (error)=>{
        context.reject(error);
    })
}

function getSiteService(siteKey/*: string*/, callback/*: CallbackTyped<SiteService>*/){
    return getSiteServicePromise(siteKey).then((data)=>{
        callback(null, data);
    },(e)=>{
        callback(e, (null/*: any*/));
    })
}

function getSiteServicePromise(siteKey/*: string*/)/*: Promise<SiteService>*/{
    return new Promise((resolve, reject)=>{
        configurationDataProvider.get(function(err, configurations){
            if(err) { reject(err); return; } 
            let siteData = configurations.sites.find((x)=>x.key===siteKey);
            let siteService = new SiteService(siteData);
            resolve(siteService);
        });
    });
}


function getWorkspaceService(siteKey/*: string*/, workspaceKey/*: string*/, callback/*: CallbackTyped<{siteService: SiteService, workspaceService: WorkspaceService}>*/){
    return getWorkspaceServicePromise(siteKey, workspaceKey).then((data)=>{
        callback(null, data);
    },(e)=>{
        callback(e, (null/*: any*/));
    })
}

async function getWorkspaceServicePromise(siteKey/*: string*/, workspaceKey/*: string*/){
    let siteService/*: SiteService*/ = await getSiteServicePromise(siteKey);
    let workspaceHead = await siteService.getWorkspaceHead(workspaceKey);
    if(workspaceHead==null) return Promise.reject(new Error('Could not find workspace.'));
    else{
        let workspaceService = new WorkspaceService(workspaceHead.path, workspaceHead.key, siteKey);
        return { siteService, workspaceService };
    }
}

api.getConfigurations = function(options/*: any*/, context/*: any*/){
    configurationDataProvider.get(function(err, data){
        if(err)
            context.reject(err);
        else
            context.resolve(data);
    }, options);
}

api.openFileExplorer = function({path}/*: any*/, context/*: any*/){
    try{
        let lstat = fs.lstatSync(path);
        if(lstat.isDirectory()){
            shell.openItem(path);
        }
        else{
            shell.openItem(dirname(path));
        }
    }
    catch(e){
    }
}

api.listWorkspaces = async function({siteKey}/*: any*/, context/*: any*/){
    let configurations = await configurationDataProvider.getPromise();
    let siteData = configurations.sites.find((x)=>x.key===siteKey);
    let service = new SiteService(siteData);
    let workspaces = await service.listWorkspaces();
    context.resolve(workspaces);
    
}

api.getWorkspaceDetails = function({siteKey, workspaceKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        let configuration = workspaceService.getConfigurationsData();
        hugoDownloader.downloader.download(configuration.hugover);
        context.resolve(configuration);
    });
}

api.mountWorkspace = async function({siteKey, workspaceKey}/*: any*/, context/*: any*/){
    let siteService = await getSiteServicePromise(siteKey);
    bindResponseToContext(
        siteService.mountWorkspace(workspaceKey),
        context
    );
}

api.serveWorkspace = function({siteKey, workspaceKey, serveKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.serve(serveKey).then(()=>{
            shell.openItem('http://localhost:1313');
            context.resolve();
        }, ()=>{
            context.reject(err); return
        });
    });
}

api.buildWorkspace = function({siteKey, workspaceKey, buildKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.build(buildKey).then(()=>{
            context.resolve();
        }, ()=>{
            context.reject(err); return
        });
    });
}

api.getSingle = function({siteKey, workspaceKey, singleKey}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.getSingle(singleKey).then(r=>{
            context.resolve(r);
        });
    });
}

api.updateSingle = function({siteKey, workspaceKey, singleKey, document}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.updateSingle(singleKey, document).then(r=>{
            context.resolve(r);
        })
    });
}

api.listCollectionItems = function({siteKey, workspaceKey, collectionKey}/*: any*/, context/*: any*/){
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

api.getCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/){
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

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.createCollectionItemKey(collectionKey, collectionItemKey)
        .then((result)=>{ context.resolve(result); })
        .catch((error)=>{ context.reject(error); });
    });
}

api.updateCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, document}/*: any*/, context/*: any*/) {
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

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/) {
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

api.copyFilesIntoCollectionItem = function ({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files }/*: any*/, context/*: any*/){
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

api.deleteCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/) {
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

api.renameCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey}/*: any*/, context/*: any*/) {
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

api.getThumbnailForCollectionItemImage = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}/*: any*/, promise/*: any*/){
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

api.createSite = function(config/*: any*/, context/*: any*/){
    siteSourceBuilderFactory.get(config.sourceType).build(config).then(() =>{
        configurationDataProvider.invalidateCache();
        context.resolve();
    }, (err)=>{
        context.reject(err);
    });
}

api.publishSite = function({siteKey, publishKey}/*: any*/, context/*: any*/){
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