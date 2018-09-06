// @flow
const FolderSiteSourceBuilder = require('./folder-site-source-builder');

/*::
import type { SiteSourceBuilder } from './types';
*/

class SiteSourceBuilderFactory{
    get(config/*: any*/) /*: SiteSourceBuilder */{
        return new FolderSiteSourceBuilder();
    }
}

module.exports = new SiteSourceBuilderFactory();