//@flow

import { BaseService } from './base-service';
import * as api from './../api';
import type { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../types.js';

export type SiteAndWorkspaceData = {
    configurations : Configurations,
    site : SiteConfig,
    siteWorkspaces: Array<WorkspaceHeader>,
    workspace: WorkspaceHeader,
    workspaceDetails: WorkspaceConfig
}

class Service extends BaseService {

    api : api.API;
    _configurations : ?Configurations;
    _configurationsPromise : ?Promise<Configurations>;
    _siteAndWorkspaceDataPromise : ?Promise<any>;   

    constructor(){
        super();
        this.api = api.instance;

        this._configurations = undefined;
        this._configurationsPromise = undefined;
        this._siteAndWorkspaceDataPromise = undefined;
    }

    getConfigurations(refetch?: boolean): Promise<Configurations>{
        if(this._configurations){
            if(refetch===true)
                this._configurations = null;
            else
                return Promise.resolve(this._configurations);
        }
        if(!this._configurationsPromise){
            this._configurationsPromise = this.api.getConfigurations({invalidateCache: refetch||false}).then((configurations)=>{
                this._configurations = configurations;
                this._configurationsPromise = null;
                return configurations;
            });
        }
        return this._configurationsPromise;
    }

    getSiteAndWorkspaceData(siteKey: string, workspaceKey: string): Promise<SiteAndWorkspaceData> {
        
        var bundle = {};

        if(this._siteAndWorkspaceDataPromise == null){
            
            let errors = [];
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
            }).then(()=>{
                return this.api.getWorkspaceDetails(siteKey, workspaceKey);
            }).then((workspaceDetails)=>{
                bundle.workspaceDetails = workspaceDetails;
                this._siteAndWorkspaceDataPromise = null;
                return bundle;
            }).catch(error=>{
                this._siteAndWorkspaceDataPromise = null;
                return Promise.reject(error);
            });
        }

        //$FlowFixMe
        return ( this._siteAndWorkspaceDataPromise: Promise<SiteAndWorkspaceData>); 
    }

    getWorkspaceDetails(siteKey: string, workspaceKey: string){
        return this.api.getWorkspaceDetails(siteKey, workspaceKey);
    }
    
    serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string){
        this.api.serveWorkspace(siteKey, workspaceKey, serveKey);
    }

    openWorkspaceDir(siteKey : string, workspaceKey : string){
        this.getSiteAndWorkspaceData(siteKey, workspaceKey)
        .then((bundle)=>{
            this.api.openFileExplorer(bundle.workspace.path);
        });
    }
}

export default new Service();