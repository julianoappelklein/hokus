import { BaseService } from "./base-service";
import * as api from "./../api";
import { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from "./../types.js";

export type SiteAndWorkspaceData = {
  configurations: Configurations;
  site: SiteConfig;
  siteWorkspaces: Array<WorkspaceHeader>;
  workspace: WorkspaceHeader;
  workspaceDetails: WorkspaceConfig;
};

class Service extends BaseService {
  api: api.API;
  _configurations: Configurations | null;
  _configurationsPromise: Promise<Configurations> | null;
  _siteAndWorkspaceDataPromise: Promise<any> | null;

  constructor() {
    super();
    this.api = api.instance;

    this._configurations = null;
    this._configurationsPromise = null;
    this._siteAndWorkspaceDataPromise = null;
  }

  async getConfigurations(refetch?: boolean): Promise<Configurations> {
    if (this._configurations != null) {
      if (refetch === true) {
        this._configurations = null;
      } else {
        return this._configurations;
      }
    }
    if (!this._configurationsPromise) {
      this._configurationsPromise = (async () => {
        const configurations = await this.api.getConfigurations({ invalidateCache: refetch || false });
        this._configurations = configurations;
        this._configurationsPromise = null;
        return configurations;
      })();
    }
    return this._configurationsPromise;
  }

  async getSiteAndWorkspaceData(siteKey: string, workspaceKey: string): Promise<SiteAndWorkspaceData> {
    if (this._siteAndWorkspaceDataPromise == null) {
      this._siteAndWorkspaceDataPromise = (async () => {
        try {
          const configurations = await this.getConfigurations();
          const site = configurations.sites.find(site => site.key === siteKey);
          const siteWorkspaces = await this.api.listWorkspaces(siteKey);
          const workspace = (siteWorkspaces || []).find((workspace: WorkspaceHeader) => workspace.key === workspaceKey);
          const workspaceDetails = await this.api.getWorkspaceDetails(siteKey, workspaceKey);
          this._siteAndWorkspaceDataPromise = null;
          return { configurations, site, siteWorkspaces, workspace, workspaceDetails };
        } catch (e) {
          this._siteAndWorkspaceDataPromise = null;
          throw e;
        }
      })();
    }

    return this._siteAndWorkspaceDataPromise;
  }

  getWorkspaceDetails(siteKey: string, workspaceKey: string) {
    return this.api.getWorkspaceDetails(siteKey, workspaceKey);
  }

  serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string) {
    this.api.serveWorkspace(siteKey, workspaceKey, serveKey);
  }

  openWorkspaceDir(siteKey: string, workspaceKey: string) {
    this.getSiteAndWorkspaceData(siteKey, workspaceKey).then(bundle => {
      this.api.openFileExplorer(bundle.workspace.path);
    });
  }
}

export default new Service();
