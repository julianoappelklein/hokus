// @flow

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const formatProviderResolver = require('./../../format-provider-resolver');
const WorkspaceConfigValidator = require('./workspace-config-validator'); 
const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder'); 
const pathHelper = require('./../../path-helper');
const { FileCacheToken } = require('./file-cache-token');

/*::
import type { WorkspaceConfig } from './../../../global-types.js';
*/

class WorkspaceConfigProvider{

    /*::
    cache: { [ file: string ]: { token: FileCacheToken, config: any  } };
    */

    constructor(){
        this.cache = {};
    }

    async getConfig(workspacePath/*: string*/, workspaceKey/*: string*/)/*: Promise<WorkspaceConfig & { path: string, key: string }>*/{       
        
        let filePath = this._getFilePath(workspacePath);
        let config/*: WorkspaceConfig*/;

        if(filePath!=null){
            const cached = this.cache[filePath];
            const token = await new FileCacheToken([filePath]).build();

            if(cached!=null){
                if(await cached.token.match(token)){ //can be reused
                    return cached.config;
                }
            }
            
            let config = this._loadConfigurationsData(filePath, workspaceKey);
            config.path = workspacePath;
            config.key = workspaceKey;
            this.cache[filePath] = { token, config }
            return config;
            
        }
        else{
            // need to build default config and update cache
            const newConfig = this._buildDefaultConfig(workspacePath);
            config = newConfig.config;
            filePath = newConfig.path;
            const token = await (new FileCacheToken([filePath])).build();
            config.path = workspacePath;
            config.key = workspaceKey;
            this.cache[filePath] = { token, config }
            return config;
        }
    }

    _getFilePath(workspacePath/*: string*/){
        let fileExp = path.join(workspacePath,'hokus.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
        return glob.sync(fileExp)[0];
    }

    _buildDefaultConfig(workspacePath/*: string*/)/*: {config: WorkspaceConfig, path: string}*/{
        let configBuilder/*: any*/ = new InitialWorkspaceConfigBuilder(workspacePath);
        let {data, formatProvider} = configBuilder.build();
        let filePath = path.join(workspacePath,'hokus.'+formatProvider.defaultExt());
        fs.writeFileSync(
            filePath, 
            formatProvider.dump(data)
        );
        return { config: data, path: filePath };
    }

    _loadConfigurationsData(filePath/*: string*/, workspaceKey/*: string*/)/*: WorkspaceConfig*/{
               
        let strData = fs.readFileSync(filePath,'utf8');
        let formatProvider = formatProviderResolver.resolveForFilePath(filePath);
        if(formatProvider==null){
            formatProvider = formatProviderResolver.getDefaultFormat();
        }
        let returnData = formatProvider.parse(strData);
        
        let validator = new WorkspaceConfigValidator();
        let result = validator.validate(returnData);
        if(result)
            throw new Error(result);

        return returnData;
    }
}

module.exports = {
    WorkspaceConfigProvider
}