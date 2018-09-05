const pathHelper = require('./../../path-helper');
const fs = require('fs-extra');
const path = require('path');
const FolderSource = require('./../../sources/folder-source');
const HugoBuilder = require('./../../hugo-builder');
const HugoServer = require('./../../hugo-server');
const WorkspaceService = require('./../workspace/workspace-service');
const publisherFactory = require('./../../publishers/publisher-factory');


//TODO: make a real factory
function siteSourceProviderFactory(sourceCfg){
    return new FolderSource();
}

class SiteService{
    constructor(config){
        this._config = config;
    }

    //List all workspaces
    listWorkspaces(){

        let sourceProvider = siteSourceProviderFactory(this._config.source);

        if(!sourceProvider.canCreateLocal()){
            return [{ 'key': 'source', 'path': this._config.source.path }];
        }

        let path = pathHelper.getSiteWorkspacesRoot(this._config.key);
        return fs.readdirSync(path)
            .filter((f) => fs.statSync(path.join(p, f)).isDirectory())
            .map((f)=> { return {
                key: f.replace(/^.*[\\\/]/, ''),
                path:f
            }});
    }

    //Create a workspace
    createWorkspace(workspaceKey){
        //TODO: later
    }

    //Remove a workspace
    deleteWorkspace(workspaceKey){
        //TODO: later
    }

    //Push workspace to origin
    pushWorkspace(workspaceKey){
        //TODO: later
    }

    _findFirstMatchOrDefault(arr, key){
        let result;
        
        if(key){
            result = (arr||[]).find(x => x.key===key);
            if(result) return result;
        }

        result = (arr||[]).find(x => x.key==='default'|| x.key==='');
        if(result) return result;

        if(arr!==undefined && arr.length===1)
            return arr[0];
        
        return result;
    }

    buildWorkspaceForPublish(workspaceKey, publishKey, callback){
        let publishConfig = this._findFirstMatchOrDefault(this._config.publish, publishKey);
        
        this._buildWorkspace(workspaceKey, publishConfig.build, callback);
    }

    _buildWorkspace(workspaceKey, buildKey, callback){
        
        let workspaceHead = this.listWorkspaces().find(x => x.key===workspaceKey);
        let workspaceService = new WorkspaceService(workspaceHead.path);
        let workspaceDetails = workspaceService.getConfigurationsData();
        
        let buildConfig=this._findFirstMatchOrDefault(this._config.build, buildKey);

        let hugoBuilderConfig = {
            hugoArgs: buildConfig.args,
            workspacePath: workspaceHead.path,
            hugover: workspaceDetails.hugover,
            env: buildConfig.env,
            destination: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        }

        let hugoBuilder = new HugoBuilder(JSON.parse(JSON.stringify(hugoBuilderConfig)));

        hugoBuilder.build(function(err, stdout, stderr){
             callback(err);            
        });
    }

    serveWorkspace(workspaceKey, callback){
        let workspaceHead = this.listWorkspaces().find(x => x.key===workspaceKey);
        let workspaceService = new WorkspaceService(workspaceHead.path);
        let workspaceDetails = workspaceService.getConfigurationsData();
        
        let serveConfig= Object.assign({env:[],args:[]}, this._config.serve);

        let hugoServerConfig = {
            hugoArgs: serveConfig.args,
            workspacePath: workspaceHead.path,
            hugover: workspaceDetails.hugover,
            env: serveConfig.env,
            destination: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        }

        let hugoServer = new HugoServer(JSON.parse(JSON.stringify(hugoServerConfig)));

        hugoServer.serve(function(err, stdout, stderr){
               
        });
        callback();
    }

    publishWorkspace(workspaceKey, publishKey, callback){
        let publishConfig = this._findFirstMatchOrDefault(this._config.publish, publishKey);
        let providerConfig = publishConfig.provider;
        let providerConfigExt = {
            localDir: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        }
        providerConfig = Object.assign(JSON.parse(JSON.stringify(providerConfig)), providerConfigExt);
        let publisher = publisherFactory.getPublisher(providerConfig);
        publisher.publish(callback);
    }

    getWorkspaceHead(workspaceKey){
        return this.listWorkspaces().find(x => x.key===workspaceKey);
    }
}

module.exports = SiteService;