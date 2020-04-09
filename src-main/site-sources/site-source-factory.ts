import { SiteSource } from "./types";
import FolderSiteSource from "./folder-site-source";
import GitSiteSource from "./git-site-source";
import { appEventEmitter } from "../app-event-emmiter";

class SiteSourceFactory {

  _activeSiteSource?: SiteSource;
  _activeSiteSourceSiteKey?: string;
  
  get(key: string, config: any): SiteSource {
    if(key === this._activeSiteSourceSiteKey){
      return this._activeSiteSource as any;
    }
    let Type = this.getType(config.type);
    let instance: SiteSource = new Type({ ...config, key });
    if(this._activeSiteSource!=null && this._activeSiteSource.dispose){
      this._activeSiteSource.dispose();
    }
    this._activeSiteSource = instance;
    this._activeSiteSourceSiteKey = key;
    if(instance.initialize){ instance.initialize(); }
    return instance;
  }

  getType(type: string): any {
    if (type === "folder") return FolderSiteSource;
    else if (type === "git") return GitSiteSource;
    else throw new Error(`Site source (${type}) not implemented.`);
  }

}

export default new SiteSourceFactory();
