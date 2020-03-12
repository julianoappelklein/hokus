// @flow

import { SiteSourceBuilder } from './types';
import FolderSiteSourceBuilder from './folder-site-source-builder';


class SiteSourceBuilderFactory{
    get(type: string) : SiteSourceBuilder {
        type = type.toLowerCase();
        if(type==='folder'){
            return new FolderSiteSourceBuilder();
        }
        else{
            throw new Error('Site source builder not implemented.');
        }
    }
}

export default new SiteSourceBuilderFactory();