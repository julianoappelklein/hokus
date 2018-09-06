//@flow

const pathHelper = require('./../../path-helper');
const fs = require('fs-extra');
const path = require('path');
const HugoBuilder = require('./../../hugo-builder');
const HugoServer = require('./../../hugo-server');
const WorkspaceService = require('./../workspace/workspace-service');
const publisherFactory = require('./../../publishers/publisher-factory');
const siteSourceFactory = require('./../../site-sources/site-source-factory');

/*::
    import type { SiteConfig, WorkspaceHeader } from './../../../global-types';
*/



class SiteService{
    /*::
        _config: SiteConfig;
    */
    constructor(config/*: SiteConfig*/){
        this._config = config;
    }

    //List all workspaces
    listWorkspaces()/*: Array<WorkspaceHeader>*/{

        let sourceProvider = siteSourceFactory.get(this._config.source);

        if(!sourceProvider.canCreateLocal()){
            return [{ 'key': 'source', 'path': this._config.source.path }];
        }

        let path = pathHelper.getSiteWorkspacesRoot(this._config.key);
        return fs.readdirSync(path)
            .filter((f) => fs.statSync(f).isDirectory())
            .map((f)=> { return {
                key: f.replace(/^.*[\\\/]/, ''),
                path:f
            }});
    }

    //Create a workspace
    createWorkspace(workspaceKey/*: any*/){
        //TODO: later
    }

    //Remove a workspace
    deleteWorkspace(workspaceKey/*: any*/){
        //TODO: later
    }

    //Push workspace to origin
    pushWorkspace(workspaceKey/*: any*/){
        //TODO: later
    }

    _findFirstMatchOrDefault/*::<T: any>*/(arr/*: Array<T>*/, key/*: string*/)/*: T*/{
        let result;
        
        if(key){
            result = (arr||[]).find(x => x.key===key);
            if(result) return result;
        }

        result = (arr||[]).find(x => x.key==='default'|| x.key==='');
        if(result) return result;

        if(arr!==undefined && arr.length===1)
            return arr[0];
        
        if(key){
            throw new Error(`Could not find a config for key "${key}" and a default value was not available.`);
        }
        else{
            throw new Error(`Could not find a default config.`);
        }
    }

    buildWorkspaceForPublish(workspaceKey/*: string*/, publishKey/*: string*/, callback/*: (error: ?Error)=>void*/){
        let publishConfig = this._findFirstMatchOrDefault(this._config.publish, publishKey);
        this._buildWorkspace(workspaceKey, publishConfig.key, callback);
    }

    _buildWorkspace(workspaceKey/*: string*/, buildKey/*: string*/, callback/*: (error: Error)=> void*/){
        
        let workspaceHeader = this.listWorkspaces().find(x => x.key===workspaceKey);
        if(workspaceHeader==null)
            throw new Error(`Could not find workspace for key "${workspaceKey}".`);

        let workspaceService = new WorkspaceService(workspaceHeader.path);
        let workspaceDetails = workspaceService.getConfigurationsData();
        
        let buildConfig=this._findFirstMatchOrDefault(this._config.build, buildKey);

        let hugoBuilderConfig = {
            hugoArgs: buildConfig.args,
            workspacePath: workspaceHeader.path,
            hugover: workspaceDetails.hugover,
            env: buildConfig.env,
            destination: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        }

        let hugoBuilder = new HugoBuilder(JSON.parse(JSON.stringify(hugoBuilderConfig)));

        hugoBuilder.build(function(err, stdout, stderr){
             callback(err);            
        });
    }

    serveWorkspace(workspaceKey/*: string*/, callback/*: (error: ?Error)=>void*/){
        let workspaceHeader = this.listWorkspaces().find(x => x.key===workspaceKey);
        if(workspaceHeader==null)
            throw new Error(`Could not find workspace for key "${workspaceKey}".`);

        let workspaceService = new WorkspaceService(workspaceHeader.path);
        let workspaceDetails = workspaceService.getConfigurationsData();
        
        let serveConfig;
        if(this._config.serve){
            serveConfig = this._findFirstMatchOrDefault(this._config.serve, '');
        }
        else{
            serveConfig = {env:[],args:[]};
        }
        
        let hugoServerConfig = {
            hugoArgs: serveConfig.args,
            workspacePath: workspaceHeader.path,
            hugover: workspaceDetails.hugover,
            env: serveConfig.env,
            destination: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        }

        let hugoServer = new HugoServer(JSON.parse(JSON.stringify(hugoServerConfig)));

        hugoServer.serve(function(err, stdout, stderr){
               
        });
        callback();
    }

    publishWorkspace(workspaceKey/*: string*/, publishKey/*: string*/, callback/*: (error: ?Error)=>void*/){
        let publishConfig = this._findFirstMatchOrDefault(this._config.publish, publishKey);
        let providerConfig = publishConfig.provider;
        let providerConfigExt = {
            localDir: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        }
        providerConfig = Object.assign(JSON.parse(JSON.stringify(providerConfig)), providerConfigExt);
        let publisher = publisherFactory.getPublisher(providerConfig);
        publisher.publish(callback);
    }

    getWorkspaceHead(workspaceKey/*: string*/){
        return this.listWorkspaces().find(x => x.key===workspaceKey);
    }
}

module.exports = SiteService;