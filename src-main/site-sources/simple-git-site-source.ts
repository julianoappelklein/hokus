import * as fs from "fs-extra";
import { SiteSource } from "./types";
import { WorkspaceHeader } from "./../../global-types";
import pathHelper from "../path-helper";
import jobManager from "../jobs/job-manager";
import { appEventEmitter, WorkspaceFileChangedEvent, SiteTouchedEvent } from "../app-event-emmiter";
import * as simpleGit from "simple-git/promise";
import * as glob from "glob";

type GitSiteSourceConfig = {
  key: string;
  url: string;
  autoSync?: boolean;
};

class SimpleGitSiteSource implements SiteSource {
  config: GitSiteSourceConfig;
  autoSync: boolean;

  canDeleteWorkspace(workspaceKey: string){
    return true;
  }

  canCreateWorkspaces() {
    return true;
  }

  async syncWorkspace(workspaceKey: string) {
    await this.stageCommitAndPush(workspaceKey);
  }

  constructor(config: GitSiteSourceConfig) {
    this.config = config;
    this.autoSync = config.autoSync ?? true;
  }

  async canSyncWorkspace(workspaceKey: string) {
    let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, workspaceKey);
    const diff = await simpleGit(repositoryPath).diff(["--stat", "origin/" + workspaceKey]);
    return diff.length > 0;
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

  async mountWorkspace(workspaceKey: string): Promise<void> {
    let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, workspaceKey);
    let workspacesRoot = pathHelper.getSiteWorkspacesRoot(this.config.key);
    try {
      fs.ensureDir(repositoryPath);
      if (await this.isEmptyDir(repositoryPath)) {
        await simpleGit(workspacesRoot).clone(this.config.url, repositoryPath);
      }
      const repo = simpleGit(repositoryPath);
      const branchResult = await repo.branch();

      if (branchResult.all.find(x => x.split("/").slice(-1)[0] === workspaceKey)) {
        await simpleGit(repositoryPath).checkout(workspaceKey);
        await simpleGit(repositoryPath).raw(["branch", `--set-upstream-to=origin/${workspaceKey}`, `${workspaceKey}`]);
      } else {
        await simpleGit(repositoryPath).checkout(["-b", workspaceKey]);
        await simpleGit(repositoryPath).push("origin", workspaceKey);
        await simpleGit(repositoryPath).raw(["branch", `--set-upstream-to=origin/${workspaceKey}`, `${workspaceKey}`]);
      }
    } catch (e) {
      await fs.remove(repositoryPath);
    }
  }

  async listWorkspaces(): Promise<Array<WorkspaceHeader>> {
    const workspaces = await jobManager.runSharedJob(`git-site-source:list-workspaces:${this.config.key}`, async () => {
      let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, "master");
      await this.ensureRepo("master");

      const masterBranchInfo = await simpleGit(repositoryPath).branch();

      let allBranches: Array<string> = Object.entries(masterBranchInfo.branches).map(
        x => x[1].name.split("/").slice(-1)[0]
      );

      const globExpression = pathHelper.getSiteWorkspacesRoot(this.config.key) + "*/.git/";
      const localWorkspacesFolders: string[] = await new Promise((resolve, reject) =>
        glob(globExpression, (err, folders) => {
          if (err) reject(err);
          else resolve(folders);
        })
      );
      const localWorkspacesMap: { [key: string]: true } = {};
      const localWorkspacesArr: string[] = [];
      localWorkspacesFolders
        .map(x => x.split("/").slice(-3, -2)[0])
        .forEach(x => {
          localWorkspacesMap[x] = true;
          localWorkspacesArr.push(x);
        });
      allBranches = allBranches.concat(localWorkspacesArr);

      var uniqueBranches: { [key: string]: boolean } = {};
      allBranches = allBranches.filter(x => {
        const isDup = uniqueBranches[x] === true;
        uniqueBranches[x] = true;
        return !isDup;
      });

      try {
        jobManager.runSharedJob(`git-site-source:fetch:${this.config.key}`, async () => {
          await simpleGit(repositoryPath).fetch(this.config.url);
        });
      } catch (e) {
        //ignore?
      }

      allBranches = allBranches.filter(x => x != "master").sort();
      allBranches = ["master"].concat(allBranches);

      let data = allBranches.map(branch => ({
        key: branch,
        path: pathHelper.getSiteWorkspaceRoot(this.config.key, branch),
        state: (localWorkspacesMap[branch] ? "mounted" : "unmounted") as any
      }));

      return data;
    });
    return workspaces;
  }

  handleSiteTouched = async (d: SiteTouchedEvent) => {
    await this.ensureRepo(d.workspaceKey);
  };

  handleWorkspaceFileChanged = async (d: WorkspaceFileChangedEvent) => {
    if (this.autoSync) {
      await this.ensureRepo(d.workspaceKey);
      this.stageCommitAndPush(d.workspaceKey);
    }
  };

  async initialize() {
    appEventEmitter.on("onSiteTouched", this.handleSiteTouched);
    appEventEmitter.on("onWorkspaceFileChanged", this.handleWorkspaceFileChanged);
  }

  dispose() {
    appEventEmitter.off("onSiteTouched", this.handleSiteTouched);
    appEventEmitter.off("onWorkspaceFileChanged", this.handleWorkspaceFileChanged);
  }

  async stageCommitAndPush(workspaceKey: string) {
    let repositoryPath = pathHelper.getSiteWorkspaceRoot(this.config.key, workspaceKey);
    const sGit = simpleGit(repositoryPath);
    await sGit.add(".");
    const status = await sGit.status();
    let committed = false;
    if (!status.isClean()) {
      await sGit.commit("Files committed automatically (HokusCMS).", [], {});
      committed = true;
    }
    await sGit.pull();
    await sGit.push();    
  }
}

export default SimpleGitSiteSource;
