//@ flow

import mainProcessBridge from './utils/main-process-bridge'

export class API {
    getConfigurations(options?: {invalidateCache: bool}){
        return mainProcessBridge.request('getConfigurations', options);
    }

    listWorkspaces(siteKey){
        return mainProcessBridge.request('listWorkspaces', {siteKey});
    }

    getWorkspaceDetails(siteKey, workspaceKey){
        return mainProcessBridge.request('getWorkspaceDetails', {siteKey, workspaceKey});
    }
    
    publishWorkspace(siteKey, workspaceKey){
        return mainProcessBridge.request('publishWorkspace', {siteKey, workspaceKey});
    }
    
    serveWorkspace(siteKey, workspaceKey){
        return mainProcessBridge.request('serveWorkspace', {siteKey, workspaceKey});
    }
    
    saveSingle(siteKey, workspaceKey, singleKey, document){
        return mainProcessBridge.request('saveSingle', {siteKey, workspaceKey, singleKey, document});
    }
    
    hasPendingRequests(){
        return mainProcessBridge.pendingCallbacks.length;
    }
    
    getSingle(siteKey, workspaceKey, singleKey){    
        return mainProcessBridge.request('getSingle', {siteKey, workspaceKey, singleKey});
    }
    
    updateSingle(siteKey, workspaceKey, singleKey, document){    
        return mainProcessBridge.request('updateSingle', {siteKey, workspaceKey, singleKey, document});
    }
    
    listCollectionItems(siteKey, workspaceKey, collectionKey){
        return mainProcessBridge.request('listCollectionItems', {siteKey, workspaceKey, collectionKey});
    }
    
    getCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey){
        return mainProcessBridge.request('getCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
    }
    
    updateCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, document){    
        return mainProcessBridge.request('updateCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, document});
    }
    
    createCollectionItemKey(siteKey, workspaceKey, collectionKey, collectionItemKey){
        return mainProcessBridge.request('createCollectionItemKey', {siteKey, workspaceKey, collectionKey, collectionItemKey});
    }
    
    deleteCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey){
        return mainProcessBridge.request('deleteCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
    }
    
    renameCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey){
        return mainProcessBridge.request('renameCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
    }
    
    openFileExplorer(path){
        mainProcessBridge.requestVoid('openFileExplorer', {path});
    }
    
    openFileDialogForCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, { title, extensions }){
        let remote= window.require('electron').remote;
        let openDialogOptions = {
            title:title||'Select Files',
            properties:['multiSelections','openFiles'],
            filters:[{name:'Allowed Extensions', extensions: extensions }]
        };
        return (new Promise((resolve)=>{
            remote.dialog.showOpenDialog(
                remote.getCurrentWindow(),
                openDialogOptions,
                (files)=> resolve(files)
            );
        })).then((files)=>{
            if(files) return mainProcessBridge.request('copyFilesIntoCollectionItem',
                {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files });
        });
    }
    
    getThumbnailForCollectionItemImage(siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath){
        return mainProcessBridge.request('getThumbnailForCollectionItemImage', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}, {timeout: 30000});
    }

    createSite(siteConfig: any){
        return mainProcessBridge.request('createSite', siteConfig);
    }
}

const api : API = new API();

//just to help debugging
// for(let key in api){
//     let wrappedFunction = api[key];
//     api[key] = function(){
//         console.log('Invoking '+key, JSON.stringify(arguments));
//         return wrappedFunction.apply(undefined, arguments);
//     }
// }

export default api;