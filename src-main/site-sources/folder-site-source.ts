import { SiteSource } from "./types";
import { WorkspaceHeader } from "./../../global-types";

type FolderSiteSourceConfig = {
  key: string;
  path: string;
};

class FolderSiteSource implements SiteSource {

  canCreateWorkspaces(){
    return false;
  }

  config: FolderSiteSourceConfig;

  constructor(config: FolderSiteSourceConfig) {
    this.config = config;
  }

  listWorkspaces(): Promise<Array<WorkspaceHeader>> {
    return Promise.resolve([{ key: "source", path: this.config.path, state: "mounted" }]);
  }

  update(): Promise<void> {
    return Promise.resolve();
  }
}

export default FolderSiteSource;
