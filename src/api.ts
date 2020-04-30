import mainProcessBridge from "./utils/main-process-bridge";
import { AbortablePromise } from "./utils/main-process-bridge";
import { Configurations, WorkspaceConfig } from "./../global-types";

export class API {
  getConfigurations(options?: { invalidateCache: boolean }): AbortablePromise<Configurations> {
    return mainProcessBridge.request("getConfigurations", options);
  }

  listWorkspaces(siteKey: string) {
    return mainProcessBridge.request("listWorkspaces", { siteKey });
  }

  getWorkspaceDetails(siteKey: string, workspaceKey: string): AbortablePromise<WorkspaceConfig> {
    return mainProcessBridge.request("getWorkspaceDetails", { siteKey, workspaceKey });
  }

  serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string) {
    return mainProcessBridge.request("serveWorkspace", { siteKey, workspaceKey, serveKey });
  }

  buildWorkspace(siteKey: string, workspaceKey: string, buildKey: string) {
    return mainProcessBridge.request("buildWorkspace", { siteKey, workspaceKey, buildKey });
  }

  saveSingle(siteKey: string, workspaceKey: string, singleKey: string, document: string) {
    return mainProcessBridge.request("saveSingle", { siteKey, workspaceKey, singleKey, document });
  }

  hasPendingRequests() {
    return mainProcessBridge.pendingCallbacks.length;
  }

  getSingle(siteKey: string, workspaceKey: string, singleKey: string) {
    return mainProcessBridge.request("getSingle", { siteKey, workspaceKey, singleKey });
  }

  updateSingle(siteKey: string, workspaceKey: string, singleKey: string, document: any) {
    return mainProcessBridge.request("updateSingle", { siteKey, workspaceKey, singleKey, document });
  }

  listCollectionItems(siteKey: string, workspaceKey: string, collectionKey: string) {
    return mainProcessBridge.request("listCollectionItems", { siteKey, workspaceKey, collectionKey });
  }

  getCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string) {
    return mainProcessBridge.request("getCollectionItem", { siteKey, workspaceKey, collectionKey, collectionItemKey });
  }

  updateCollectionItem(
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    document: any
  ) {
    return mainProcessBridge.request("updateCollectionItem", {
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey,
      document
    });
  }

  createCollectionItemKey(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string) {
    return mainProcessBridge.request("createCollectionItemKey", {
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey
    });
  }

  deleteCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string) {
    return mainProcessBridge.request("deleteCollectionItem", {
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey
    });
  }

  renameCollectionItem(
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    collectionItemNewKey: string
  ) {
    return mainProcessBridge.request("renameCollectionItem", {
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey,
      collectionItemNewKey
    });
  }

  openFileExplorer(path: string) {
    mainProcessBridge.requestVoid("openFileExplorer", { path });
  }

  async openFileDialogForCollectionItem(
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    { title, extensions }: { title: string; extensions: Array<string> }
  ) {
    let remote = window.require("electron").remote;
    let openDialogOptions = {
      title: title || "Select Files",
      properties: ["multiSelections", "openFile"],
      filters: [{ name: "Allowed Extensions", extensions: extensions }]
    };
    const { filePaths }: { filePaths: string[] } = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      openDialogOptions
    );

    if (filePaths)
      return mainProcessBridge.request("copyFilesIntoCollectionItem", {
        siteKey,
        workspaceKey,
        collectionKey,
        collectionItemKey,
        targetPath,
        files: filePaths
      });
  }

  async openFileDialogForSingle(
    siteKey: string,
    workspaceKey: string,
    singleKey: string,
    targetPath: string,
    { title, extensions }: { title: string; extensions: Array<string> }
  ) {
    let remote = window.require("electron").remote;
    let openDialogOptions = {
      title: title || "Select Files",
      properties: ["multiSelections", "openFile"],
      filters: [{ name: "Allowed Extensions", extensions: extensions }]
    };
    const { filePaths }: { filePaths: string[] } = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      openDialogOptions
    );

    if (filePaths)
      return mainProcessBridge.request("copyFilesIntoSingle", {
        siteKey,
        workspaceKey,
        singleKey,
        targetPath,
        files: filePaths
      });
  }

  getThumbnailForCollectionItemImage(
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string
  ) {
    return mainProcessBridge.request(
      "getThumbnailForCollectionItemImage",
      { siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath },
      { timeout: 30000 }
    );
  }

  getThumbnailForSingleImage(siteKey: string, workspaceKey: string, singleKey: string, targetPath: string) {
    return mainProcessBridge.request(
      "getThumbnailForSingleImage",
      { siteKey, workspaceKey, singleKey, targetPath },
      { timeout: 30000 }
    );
  }

  createSite(siteConfig: any) {
    return mainProcessBridge.request("createSite", siteConfig);
  }

  publishSite(siteKey: string, publishKey: string) {
    return mainProcessBridge.request("publishSite", { siteKey, publishKey });
  }

  getHugoTemplates() {
    return mainProcessBridge.request("getHugoTemplates", null, { timeout: 30000 });
  }

  touchSite(siteKey: string, workspaceKey: string) {
    return mainProcessBridge.request("touchSite", { siteKey, workspaceKey });
  }

  mountWorkspace(siteKey: string, workspaceKey: string) {
    return mainProcessBridge.request("mountWorkspace", { siteKey, workspaceKey });
  }

  getSiteDependencyStatus(siteKey: string): Promise<any> {
    return mainProcessBridge.request("getSiteDependencyStatus", { siteKey });
  }

  getSiteSourceDependencyStatus(siteSourceType: string): Promise<any> {
    return mainProcessBridge.request("getSiteSourceDependencyStatus", { siteSourceType });
  }

  canSyncWorkspace(siteKey: string, workspaceKey: string): Promise<any> {
    return mainProcessBridge.request("canSyncWorkspace", { siteKey, workspaceKey });
  }

  syncWorkspace(siteKey: string, workspaceKey: string): Promise<any> {
    return mainProcessBridge.request("syncWorkspace", { siteKey, workspaceKey });
  }

  getWorkspaceConfig(siteKey: string, workspaceKey: string) {
    return mainProcessBridge.request("getWorkspaceConfig", { siteKey, workspaceKey });
  }

  setWorkspaceConfig(siteKey: string, workspaceKey: string, data: any) {
    return mainProcessBridge.request("setWorkspaceConfig", { siteKey, workspaceKey, data });
  }
}

export const instance = new API();

// (()=>{
//     // just to help debugging
//     const api:any = instance;
//     const methods = Object.getOwnPropertyNames( API.prototype );
//     for(let i = 0; i < methods.length; i++){
//         const key = methods[i];
//         let wrappedFunction = api[key];
//         api[key] = function(){
//             console.log('Invoking '+key, JSON.stringify(arguments));
//             return wrappedFunction.apply(undefined, arguments);
//         }
//     }
// })()
