import * as fs from "fs-extra";
import { SiteSource } from "./types";
import { WorkspaceHeader } from "./../../global-types";
import pathHelper from "../path-helper";
import jobManager from "../jobs/job-manager";
import { appEventEmitter, WorkspaceFileChangedEvent, SiteTouchedEvent } from "../app-event-emmiter";
import * as simpleGit from "simple-git/promise";

type GitSiteSourceConfig = {
  key: string;
  url: string;
};

class SimpleGitSiteSource implements SiteSource {
  config: GitSiteSourceConfig;

  constructor(config: any) {
    this.config = config;
  }

  private async isEmptyDir(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, function(err: Error, files: string[]) {
        if (err) reject(err);
        else resolve(files.length === 0);
      });
    });
  }

  private async ensureRepo(workspaceKey: string): Promise<void> {
    let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, workspaceKey);
    let workspacesRoot = pathHelper.getSiteWorkspacesRoot(this.config.key);
    fs.ensureDir(repositoryPath);
    if (await this.isEmptyDir(repositoryPath)) {
      await simpleGit(workspacesRoot).clone(this.config.url, repositoryPath);
    }
    await simpleGit(repositoryPath).checkout(workspaceKey);
  }

  async listWorkspaces(): Promise<Array<WorkspaceHeader>> {
    const workspaces = await jobManager.runSharedJob(`git-site-source:list-workspaces:${this.config.key}`, async () => {
      let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, "master");
      await this.ensureRepo("master");
      const branchInfo = await simpleGit(repositoryPath).branch();
      let branchesInfo: Array<{ name: string; current: boolean }> = Object.entries(branchInfo.branches).map(x => ({
        name: x[1].name.split("/").slice(-1)[0],
        current: x[1].current
      }));
      var uniqueBranches: { [key: string]: boolean } = {};
      branchesInfo = branchesInfo.filter(x => {
        const isDup = uniqueBranches[x.name] === true;
        uniqueBranches[x.name] = true;
        return !isDup;
      });

      try {
        jobManager.runSharedJob(`git-site-source:fetch:${this.config.key}`, async () => {
          await simpleGit(repositoryPath).fetch(this.config.url);
        });
      } catch (e) {
        //ignore?
      }

      let data = branchesInfo.map(branch => ({
        key: branch.name,
        path: pathHelper.getSiteWorkspaceRoot(this.config.key, branch.name),
        state: (branch.current ? "mounted" : "unmounted") as any
      }));

      return data;
    });
    return workspaces;
  }

  handleSiteTouched = async (d: SiteTouchedEvent) => {
    await this.ensureRepo(d.workspaceKey);
  };

  handleWorkspaceFileChanged = async (d: WorkspaceFileChangedEvent) => {
    await this.ensureRepo(d.workspaceKey);
    this.stageCommitAndPush(d.workspaceKey, d.files);
  };

  async initialize() {
    appEventEmitter.on("onSiteTouched", this.handleSiteTouched);
    appEventEmitter.on("onWorkspaceFileChanged", this.handleWorkspaceFileChanged);
  }

  dispose() {
    appEventEmitter.off("onSiteTouched", this.handleSiteTouched);
    appEventEmitter.off("onWorkspaceFileChanged", this.handleWorkspaceFileChanged);
  }

  async stageCommitAndPush(workspaceKey: string, files: string[]) {
    let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, workspaceKey);
    const sGit = simpleGit(repositoryPath);
    await sGit.pull();
    await sGit.add(".");
    await sGit.commit("Files commited automatically.", [], {});
    await sGit.push();
  }

  async update(): Promise<void> {
    //huuumm...
  }
}

export default SimpleGitSiteSource;
