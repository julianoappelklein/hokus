import { SiteInitializer } from "./types";
import FolderSiteInitializer from "./folder-site-initilizer";
import GitSiteInitializer from "./git-site-initializer";

class SiteInitializerFactory {
  get(type: string): SiteInitializer {
    type = type.toLowerCase();
    if (type === "folder") {
      return new FolderSiteInitializer();
    } else if (type === "git") {
      return new GitSiteInitializer();
    } else {
      throw new Error("Site source builder not implemented.");
    }
  }
}

export default new SiteInitializerFactory();
