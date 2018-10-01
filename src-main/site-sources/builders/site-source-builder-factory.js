// @flow
const FolderSiteSourceBuilder = require('./folder-site-source-builder');

/*::
import type { SiteSourceBuilder } from './types';
*/

class SiteSourceBuilderFactory{
    get(type/*: string*/) /*: SiteSourceBuilder */{
        type = type.toLowerCase();
        if(type==='folder'){
            return new FolderSiteSourceBuilder();
        }
        else{
            throw new Error('Site source builder not implemented.');
        }
    }
}

module.exports = new SiteSourceBuilderFactory();