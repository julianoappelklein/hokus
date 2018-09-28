//@flow

const formatProviderResolver = require('./../../format-provider-resolver');
const path = require('path');
const glob = require('glob');

/*::
import type { WorkspaceConfigRaw } from './../../../global-types.js';

type GetConfigOpts = {
    hugover: string,
    configFile: string,
    ext: string
};

*/

class InitialWorkspaceConfigBuilder{

    /*::
    workspacePath: string
    */

    constructor(workspacePath/*: string*/){
        this.workspacePath = workspacePath;
    }

    getConfig(opts/*: GetConfigOpts*/)/*: WorkspaceConfigRaw*/{

        return {
            "hugover": opts.hugover||'',
            "serve":[
                {"key": "default", "config": opts.configFile }
            ],
            "build":[
                {"key": "default", "config": opts.configFile }
            ],
            "collections":[
                {
                    "key": "posts",
                    "title": "Posts",
                    "folder": "content/posts/",
                    "extension": "md",
                    "dataformat": opts.ext,
                    "itemtitle": "Post",
                    "fields":[
                        { "type":"info", "content":"# Info\nYou can write custom instructions here." },
                        { "key":"title", "title":"Title", "type":"string" },
                        { "key":"mainContent", "title":"Content", "type":"markdown" },
                        { "key":"pubdate", "title":"Pub Date", "type":"date" },
                        { "key":"draft", "title":"Draft", "type":"boolean" },
                        { "key":"bundle-manager", "type":"bundle-manager", "resourcetype":"img", "path":"imgs", "extensions":["png","jpg","gif"], "fields":[
                            { "key":"title", "title":"Title", "type":"string" },
                            { "key":"description", "title":"Description", "type":"string", "multiLine":true }
                        ]}
                    ]
                }
            ],
            "singles":[
                {
                    "key": "mainConfig",
                    "title": "Main Config",
                    "file": `config.${opts.ext}`,
                    "fields":[
                        { "key":"title", "title":"Site Title", "type":"string", "tip":"Your page title." },
                        { "key":"baseURL", "title":"Base URL", "type":"string", "tip":"Your production URL." },
                        { "key":"theme", "title":"Theme", "type":"readonly", "tip":"The current theme." },
                        { "key":"languageCode", "title":"Language Code", "type":"readonly" },
                        { "key":"googleAnalytics", "title":"Google Analytics", "type":"string", "tip":"Provide a Google Analitics Tracking Code to enable analytics." },
                        { "key":"enableRobotsTXT", "title":"Enable Robots", "type":"boolean", "default":true, "tip":"If you want you page to be indexed, keep this enabled." }
                    ]
                }
            ]
        }
    }

    build(){
        let hugoConfigExp = path.join(this.workspacePath,'config.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
        let hugoConfigPath = glob.sync(hugoConfigExp)[0];
        if(!hugoConfigPath)
            hugoConfigPath = path.join(this.workspacePath, 'config.'+formatProviderResolver.getDefaultFormatExt());
        
        hugoConfigPath = path.relative(this.workspacePath, hugoConfigPath);

        let formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigPath) || formatProviderResolver.getDefaultFormat();        
        let data = this.getConfig({configFile: hugoConfigPath, ext: formatProvider.defaultExt(), hugover:'0.45'});

        return {formatProvider, data};
    }
}

module.exports = InitialWorkspaceConfigBuilder;