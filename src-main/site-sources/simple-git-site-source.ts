import * as fs from "fs-extra";
import { SiteSource } from "./types";
import { WorkspaceHeader } from "./../../global-types";
import pathHelper from "../path-helper";
import jobManager from "../jobs/job-manager";
import { appEventEmitter } from "../app-event-emmiter";
import * as simpleGit from 'simple-git/promise';

type GitSiteSourceConfig = {
  key: string;
  url: string;
};

class SimpleGitSiteSource implements SiteSource {
  config: GitSiteSourceConfig;

  constructor(config: any) {
    this.config = config;
  }

  async _isEmptyDir(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, function(err: Error, files: string[]) {
        if (err) reject(err);
        else resolve(files.length === 0);
      });
    });
  }

  async _ensureRepo(): Promise<void> {
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
    let siteRootPath = pathHelper.getSiteRoot(this.config.key);
    fs.ensureDir(siteRootPath);

    if (await this._isEmptyDir(siteRootPath)) {
      await simpleGit(repositoryPath).clone(this.config.url);
    }
  }

  async listWorkspaces(): Promise<Array<WorkspaceHeader>> {
    const workspaces = await jobManager.runSharedJob(`git-site-source:list-workspaces:${this.config.key}`, async () => {
      let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
      let repoNamePrefix = /^(refs\/heads|refs\/remotes\/origin)\//i;
      await this._ensureRepo();
      const branchInfo = await simpleGit(repositoryPath).branch();
      let branchesInfo: Array<{name: string, current: boolean}> = Object.entries(branchInfo.branches).map(x => ({name: x[1].name, current: x[1].current}));

      try {
        jobManager.runSharedJob(`git-site-source:fetch:${this.config.key}`, async () => {
          await simpleGit(repositoryPath).fetch(this.config.url);
        });
      } catch (e) {
        //ignore?
      }

      function onlyUnique<T>(value: T, index: number, self: Array<T>) {
        return self.indexOf(value) === index;
      }

      let data = branchesInfo.map(branch => ({
        key: branch.name,
        path: pathHelper.getSiteWorkspacesRoot(this.config.key),
        state: branch.current ? "mounted" : "unmounted"
      }));

      return data;
    });
    return workspaces;
  }

  async initialize() {
    appEventEmitter.on("onSiteTouched", async d => {
      await this.ensureMountedWorkspace(d.workspaceKey);
    });
    appEventEmitter.on("onWorkspaceFileChanged", async d => {
      await this.ensureMountedWorkspace(d.workspaceKey);
      this.stageCommitAndPush(d.workspaceKey, d.files);
    });
  }

  dispose() {}

  async stageCommitAndPush(workspaceKey: string, files: string[]) {
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
    const sGit = simpleGit(repositoryPath);
    await sGit.pull();
    await sGit.add(".");
    await sGit.commit("Files commited automatically.", [], {  });
    await sGit.push();
  }

  async ensureMountedWorkspace(workspaceKey: string) {
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
    let branch = await simpleGit(repositoryPath).branch();
    if (branch.current!==workspaceKey){
      await this.mountWorkspace(workspaceKey);
    }
  }

  async mountWorkspace(workspaceKey: string): Promise<void> {
    await this._ensureRepo();
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
    let branches = await simpleGit(repositoryPath).branch();
    let currentBranchEntry = Object.entries(branches.branches).find(x => x[1].name === workspaceKey);
    const refName = currentBranchEntry?.[1].name || 'master';
    await simpleGit(repositoryPath).checkout(refName);
  }

  async update(): Promise<void> {
    //huuumm...
  }
}

export default SimpleGitSiteSource;
