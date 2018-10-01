// @flow
/*::
import { SiteSourceBuilder } from './types';
import type { RawSiteConfig } from './../../../global-types';

type BuildConfig = {
    folderPath: string,
    theme: string,
    key: string
};

*/
const fs = require('fs-extra');
const pathHelper = require('./../../path-helper');
const ThemeInstaller = require('./../../hugo/hugo-theme-installer');

class FolderSiteSourceBuilder/*:: implements SiteSourceBuilder*/ {
    
    constructor(){
        
    }

    async build(config/*: BuildConfig*/)/*:Promise<void>*/{
        //create a hokus config
        //create a config

        if(config.theme!=null && config.theme){
            let themeInstaller = new ThemeInstaller();
            await themeInstaller.siteFromTheme(config.theme, config.folderPath);
        }

        let siteConfig/*: RawSiteConfig*/ = {
            key: config.key,
            name: config.key,
            source: { type: 'folder', path: config.folderPath },
            publish: [
                {
                    key: 'default',
                    config: {
                        type: 'folder', //will publish to a folder
                        path: null //will use the default generated path
                    }
                }
            ]
        };

        let configPath = `${pathHelper.getRoot()}config.${config.key}.json`;
        fs.ensureDirSync(pathHelper.getRoot());
        fs.writeFileSync(configPath, JSON.stringify(siteConfig,null,'  '), 'utf8');
    }

}

module.exports = FolderSiteSourceBuilder;