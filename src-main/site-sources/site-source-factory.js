// @flow
const FolderSiteSource = require('./folder-site-source');

/*::
import type { SiteSource } from './types';
*/

class SiteSourceFactory{
    get(config/*: any*/) /*: SiteSource */{
        return new FolderSiteSource(config);
    }

    getType(config/*: any*/)/*: any*/{
        return FolderSiteSource;
    }
}

module.exports = new SiteSourceFactory();