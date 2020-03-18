import { SiteSource } from "./types";
import FolderSiteSource from "./folder-site-source";
import GitSiteSource from "./git-site-source";

class SiteSourceFactory {
  get(key: string, config: any): SiteSource {
    let Type = this.getType(config.type);
    let instance /*:any*/ = new Type({ ...config, key });
    return instance;
  }

  getType(type: string): any {
    if (type === "folder") return FolderSiteSource;
    else if (type === "git") return GitSiteSource;
    else throw new Error(`Site source (${type}) not implemented.`);
  }
}

export default new SiteSourceFactory();
