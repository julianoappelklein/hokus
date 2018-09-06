// @flow
/*::
import { SiteSourceBuilder } from './types';
import type { RawSiteConfig } from './../../../global-types';

type BuildConfig = {
    folderPath: string,
    key: string
};

*/
const fs = require('fs');
const pathHelper = require('./../../path-helper');

class FolderSiteSourceBuilder/*:: implements SiteSourceBuilder*/ {
    
    constructor(){
        
    }

    build(config/*: BuildConfig*/)/*:void*/{
        //create a hokus config
        //create a config

        let siteConfig/*: RawSiteConfig*/ = {
            key: config.key,
            name: config.key,
            source: { type: 'Folder', path: config.folderPath },
            serve: [
                {
                    "args": [],
                    "env": {}
                }
            ],
            build: [],
            transform: [],
            publish: []
        };

        let configPath = `${pathHelper.getRoot()}config.${config.key}.json`;

        fs.writeFileSync(configPath, JSON.stringify(siteConfig,null,'  '), 'utf8');
    }

}

module.exports = FolderSiteSourceBuilder;