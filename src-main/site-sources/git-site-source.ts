import git from "isomorphic-git";
import gitHttp from "isomorphic-git/http/node";
import * as fs from "fs-extra";
import { SiteSource } from "./types";
import { WorkspaceHeader } from "./../../global-types";
import pathHelper from "../path-helper";
import jobManager from "../jobs/job-manager";
import { appEventEmitter } from "../app-event-emmiter";
import * as nodePath from "path";

type GitSiteSourceConfig = {
  key: string;
  url: string;
};

class GitSiteSource implements SiteSource {
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
      await git.clone({ fs: fs, http: gitHttp, dir: repositoryPath, url: this.config.url });
    } else {
      //so?
      //return NodeGit.Repository.open(repositoryPath);
    }
  }

  async listWorkspaces(): Promise<Array<WorkspaceHeader>> {
    const workspaces = await jobManager.runSharedJob(`git-site-source:list-workspaces:${this.config.key}`, async () => {
      let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
      let repoNamePrefix = /^(refs\/heads|refs\/remotes\/origin)\//i;
      await this._ensureRepo();
      let branches: string[] = await git.listBranches({ fs, dir: repositoryPath });
      let currentBranchRef = await git.currentBranch({ fs, dir: repositoryPath });
      if (currentBranchRef == null) throw new Error();
      let currentBranchName = currentBranchRef.replace(repoNamePrefix, "");

      try {
        jobManager.runSharedJob(`git-site-source:fetch:${this.config.key}`, async () => {
          await git.fetch({ fs, dir: repositoryPath, http: gitHttp, url: this.config.url });
        });
      } catch (e) {
        //ignore?
      }

      function onlyUnique<T>(value: T, index: number, self: Array<T>) {
        return self.indexOf(value) === index;
      }

      branches = branches.map(branch => branch.replace(repoNamePrefix, "")).filter(onlyUnique);
      let data = branches.map(branch => ({
        key: branch,
        path: pathHelper.getSiteWorkspacesRoot(this.config.key),
        state: branch === currentBranchName ? "mounted" : "unmounted"
      }));

      return data;
    });
    return workspaces;
  }

  async initialize() {
    appEventEmitter.on("onWorkspaceFileChanged", async d => {
      await this.ensureMountedWorkspace(d.workspaceKey);
      this.stageCommitAndPush(d.workspaceKey, d.files);
    });
  }

  dispose() {}

  async stageCommitAndPush(workspaceKey: string, files: string[]) {
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await git.add({ fs, dir: repositoryPath, filepath: nodePath.relative(repositoryPath, file) });
    }
    await git.commit({ fs, dir: repositoryPath, message: "Files commited automatically.", author:{name:"hokus", email:"commiter@hokus.com"}, });
    await git.push({ fs, dir: repositoryPath, http: gitHttp });
  }

  async ensureMountedWorkspace(workspaceKey: string) {
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(workspaceKey);
    // let branch = await git.currentBranch({ fs, dir: repositoryPath, fullname: false });
    // if (branch !== workspaceKey)
    await this.mountWorkspace(workspaceKey);
  }

  async mountWorkspace(workspaceKey: string): Promise<void> {
    await this._ensureRepo();
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
    let branches: string[] = await git.listBranches({ fs, dir: repositoryPath });
    let refName = branches.find(x => x.endsWith("/" + workspaceKey) && x.indexOf("/remotes/") !== -1);
    if (refName == null) refName = branches.find(x => x.endsWith("/" + workspaceKey)) || "master";
    await git.checkout({ fs, dir: repositoryPath, ref: refName });

    //do a regular pull

    //let remote = await NodeGit.Remote.create(repo, "origin", this.config.url);
    // await repo.pull(this._getNodeGitFetchOptions());
    // await repo.push(this._getNodeGitFetchOptions());
  }

  async update(): Promise<void> {
    //huuumm...
  }
}

export default GitSiteSource;
