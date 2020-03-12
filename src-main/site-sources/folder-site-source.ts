import { SiteSource } from "./types";
import { WorkspaceHeader } from "./../../global-types";

type FolderSiteSourceConfig = {
  key: string;
  path: string;
};

class FolderSiteSource implements SiteSource {
  config: FolderSiteSourceConfig;

  constructor(config: FolderSiteSourceConfig) {
    this.config = config;
  }

  listWorkspaces(): Promise<Array<WorkspaceHeader>> {
    return Promise.resolve([{ key: "source", path: this.config.path, state: "mounted" }]);
  }

  mountWorkspace(key: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  unmountWorkspace(key: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  update(): Promise<void> {
    return Promise.resolve();
  }
}

export default FolderSiteSource;
