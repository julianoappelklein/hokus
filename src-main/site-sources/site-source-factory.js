// @flow
const FolderSiteSource = require('./folder-site-source');
const GitSiteSource = require('./git-site-source');

/*::
import type { SiteSource } from './types';
*/

class SiteSourceFactory{
    get(key/*:string*/, config/*: any*/) /*: SiteSource */{
        let Type = this.getType(config);
        let instance/*:any*/ = new Type({...config, key});
        return instance;
    }

    getType(config/*: any*/)/*: any*/{
        let type = config.type.toLowerCase();
        if(type==='folder')
            return FolderSiteSource;
        else if(type==='git')
            return GitSiteSource;
        else
            throw new Error(`Site source (${config.type}) not implemented.`);
    }
}

module.exports = new SiteSourceFactory();