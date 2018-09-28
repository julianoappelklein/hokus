//@flow

const pathHelper = require('./../../path-helper');
const fs = require('fs-extra');
const path = require('path');
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

    getWorkspaceHead(workspaceKey/*: string*/){
        return this.listWorkspaces().find(x => x.key===workspaceKey);
    }

    //publishWorkspace(workspaceKey/*: string*/, publishKey/*: string*/, callback/*: (error: ?Error)=>void*/){
    publish(publishKey/*: string*/)/*: Promise<void>*/{
        return Promise.resolve();
        // let publishConfig = this._findFirstMatchOrDefault(this._config.publish, publishKey);
        // let providerConfig = publishConfig.provider;
        // let providerConfigExt = {
        //     localDir: pathHelper.getBuildDestination(this._config.key, workspaceKey)
        // }
        // providerConfig = Object.assign(JSON.parse(JSON.stringify(providerConfig)), providerConfigExt);
        // let publisher = publisherFactory.getPublisher(providerConfig);
        // publisher.publish(callback);
        
    }
}

module.exports = SiteService;