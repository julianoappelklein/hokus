import { SiteSource } from "../../global-types";
import FolderSiteSource from "./folder-site-source";
const GitSiteSource = require('./git-site-source');

class SiteSourceFactory{
    get(key:string, config: any): SiteSource<any> {
        let Type = this.getType(config);
        let instance/*:any*/ = new Type({...config, key});
        return instance;
    }

    getType(config: any): any{
        let type = config.type.toLowerCase();
        if(type==='folder')
            return FolderSiteSource;
        else if(type==='git')
            return GitSiteSource;
        else
            throw new Error(`Site source (${config.type}) not implemented.`);
    }
}

export default new SiteSourceFactory();