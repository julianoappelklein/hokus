let {dialog, remote} = require('electron');
const FolderSource = require('./sources/folder-source');
const configurationDataProvider = require('./configuration-data-provider')
const SiteService = require('./services/site/site-service')
const WorkspaceService = require('./services/workspace/workspace-service')
const hugoDownloader = require('./hugo-downloader')
const opn = require('opn');

let api = {};

function sourceProviderFactory(sourceCfg){
    // TODO: use a real factory.
    return new FolderSource();
}

function getSiteService(siteKey, callback){
    configurationDataProvider.get(function(err, configurations){
        if(err){ callback(err); return; }
        let siteData = configurations.sites.find((x)=>x.key===siteKey);
        let siteService = new SiteService(siteData);
        callback(undefined, siteService);
    });
}

function getSiteServicePromise(siteKey, callback){
    return new Promise((resolve, reject)=>{
        configurationDataProvider.get(function(err, configurations){
            if(e) { reject(e); return; } 
            let siteData = configurations.sites.find((x)=>x.key===siteKey);
            let siteService = new SiteService(siteData);
            resolve(siteService);
        });
    });
}

function getWorkspaceService(siteKey, workspaceKey, callback){
    getSiteService(siteKey, function(err, siteService){
        if(err){ callback(err); return; }
        let workspaceHead = siteService.getWorkspaceHead(workspaceKey);
        let workspaceService = new WorkspaceService(workspaceHead.path);
        callback(undefined, {siteService, workspaceService});
    });
}

function getWorkspaceServicePromise(siteKey, workspaceKey, callback){
    getSiteServicePromise(siteKey)
    .then((siteService)=>{
        let workspaceHead = siteService.getWorkspaceHead(workspaceKey);
        let workspaceService = new WorkspaceService(workspaceHead.path);
        return Promise.resolve({siteService, workspaceService});
    })
    .catch((e)=>{ return Promise.reject(e); });
}

api.getConfigurations = function(args, promise){
    configurationDataProvider.get(function(err, data){
        if(err)
            promise.reject(err);
        else
            promise.resolve(data);
    });
}

api.openFileExplorer = function({path}, promise){   
    
    require('child_process').exec('start "" "'+path+'"');
}

api.listWorkspaces = function({siteKey}, promise){
    configurationDataProvider.get(function(err, configurations){
        if(err){ promise.reject(err); return; }
        let siteData = configurations.sites.find((x)=>x.key===siteKey);
        let service = new SiteService(siteData);
        promise.resolve(service.listWorkspaces());
    });
}

api.getWorkspaceDetails = function({siteKey, workspaceKey}, promise){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        let configuration = workspaceService.getConfigurationsData();
        hugoDownloader.downloader.download(configuration.hugover);
        promise.resolve(configuration);
    });
}

api.serveWorkspace = function({siteKey, workspaceKey}, promise){
    getSiteService(siteKey, function(err, siteService){
        if(err){ promise.reject(err); return; }
        siteService.serveWorkspace(workspaceKey, function(err){
            if(err){
                promise.reject(err); return
            }
            opn('http://localhost:1313');
            promise.resolve();
        });
    });
}

api.publishWorkspace = function({siteKey, workspaceKey, publishKey}, promise){
    getSiteService(siteKey, function(err, siteService){
        if(err){ promise.reject(err); return; }
        siteService.buildWorkspaceForPublish(workspaceKey, publishKey, function(err){
            if(err){ promise.reject(err); return }
            else{
                siteService.publishWorkspace(workspaceKey, publishKey, function(err){
                    if(err){ promise.reject(err); return }
                    else{
                        promise.resolve();
                    }
                })
            }
        })
    });
}

api.getSingle = function({siteKey, workspaceKey, singleKey}, promise) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.getSingle(singleKey).then(r=>{
            promise.resolve(r);
        });
    });
}

api.updateSingle = function({siteKey, workspaceKey, singleKey, document}, promise) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.updateSingle(singleKey, document).then(r=>{
            promise.resolve(r);
        })
   });
}

api.listCollectionItems = function({siteKey, workspaceKey, collectionKey}, promise){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.listCollectionItems(collectionKey)
        .then((result)=>{
            promise.resolve(result)
        })
        .catch((error)=>{
            promise.reject(error);
        });
   });
}

api.getCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, promise){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.getCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{ 
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, promise){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.createCollectionItemKey(collectionKey, collectionItemKey)
        .then((result)=>{ promise.resolve(result); })
        .catch((error)=>{ promise.reject(error); });
    });
}

api.updateCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, document}, promise) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.updateCollectionItem(collectionKey, collectionItemKey, document)
        .then((result)=>{ 
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, promise) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.createCollectionItemKey(collectionKey, collectionItemKey)
        .then((result)=>{ 
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.copyFilesIntoCollectionItem  = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files }, promise){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.copyFilesIntoCollectionItem(collectionKey, collectionItemKey, targetPath, files)
        .then((result)=>{
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.deleteCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, promise) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.deleteCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{
            promise.resolve({deleted:result});
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.renameCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey}, promise) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.renameCollectionItem(collectionKey, collectionItemKey, collectionItemNewKey)
        .then((result)=>{
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
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

module.exports = api;