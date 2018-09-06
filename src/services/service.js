//@flow

import {BaseService} from './base-service';
import api from './../api'


import type { Configurations, SiteConfig, WorkspaceHeader } from './../types.js';
import type API from './../api.js';
export type SiteAndWorkspaceData = {
    configurations : Configurations,
    site : SiteConfig,
    siteWorkspaces: Array<WorkspaceHeader>,
    workspace: WorkspaceHeader
}

class Service extends BaseService {

    api : API;
    _configurations : ?Configurations;
    _configurationsPromise : ?Promise<Configurations>;
    _siteAndWorkspaceDataPromise : ?Promise<any>;   

    constructor(){
        super();
        this.api = api;

        this._configurations = undefined;
        this._configurationsPromise = undefined;
        this._siteAndWorkspaceDataPromise = undefined;
    }

    getConfigurations(refetch?: boolean) /* : Promise<Configurations> */{
        if(this._configurations){
            if(refetch===true)
                this._configurations = null;
            else
                return Promise.resolve(this._configurations);
        }
        if(!this._configurationsPromise){
            this._configurationsPromise = api.getConfigurations({invalidateCache: refetch}).then((configurations)=>{
                this._configurations = configurations;
                this._configurationsPromise = null;
                return configurations;
            });
        }
        return this._configurationsPromise;
    }

    getSiteAndWorkspaceData(siteKey /* : string */, workspaceKey /* : string */) /* : Promise<SiteAndWorkspaceData> */ {
        
        var bundle = {};

        if(this._siteAndWorkspaceDataPromise == null){            
            
            this._siteAndWorkspaceDataPromise = this.getConfigurations()
            .then((configurations)=>{
                bundle.configurations = configurations;
                //$FlowFixMe
                bundle.site = configurations.sites.find(site => { return site.key === siteKey });
                //$FlowFixMe
                return this.api.listWorkspaces(siteKey);        
            }).then((workspaces)=>{
                bundle.siteWorkspaces = workspaces;
                bundle.workspace = workspaces.find((workspace) => { return workspace.key === workspaceKey });               
                this._siteAndWorkspaceDataPromise = null;
                return bundle;
            });
        }

        this._siteAndWorkspaceDataPromise.then((data)=>{
            console.log(siteKey, data.site);
        })

        //$FlowFixMe
        return ( this._siteAndWorkspaceDataPromise /* : Promise<SiteAndWorkspaceData> */ ); 
    }

    getWorkspaceDetails(siteKey /* : string */, workspaceKey /* : string */){
        return api.getWorkspaceDetails(siteKey, workspaceKey);
    }
    
    serveWorkspace(siteKey /* : string */, workspaceKey /* : string */){
        this.api.serveWorkspace(siteKey, workspaceKey);
    }

    openWorkspaceDir(siteKey : string, workspaceKey : string){
        this.getSiteAndWorkspaceData(siteKey, workspaceKey)
        .then((bundle)=>{
            this.api.openFileExplorer(bundle.workspace.path);
        });
    }
}

export default new Service();