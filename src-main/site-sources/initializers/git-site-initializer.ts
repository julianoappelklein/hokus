import { SiteInitializer } from "./types";
import { RawSiteConfig } from "./../../../global-types";
import * as fs from "fs-extra";
import pathHelper from "../../path-helper";
import * as simpleGit from 'simple-git/promise';

type BuildConfig = {
  key: string;
  url: string;
  path: string;
  autoSync?: boolean;
};

export default class GitSiteInitializer implements SiteInitializer {
  constructor() {}

  _isEmptyDir(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, function(err: Error, files: string[]) {
        if (err) reject(err);
        else resolve(files.length === 0);
      });
    });
  }

  async initialize(config: BuildConfig): Promise<void> {
    let repositoryPath = pathHelper.getSiteWorkspacesRoot(config.key);
    let siteRootPath = pathHelper.getSiteRoot(config.key);
    await fs.ensureDir(siteRootPath);
    const isEmptyDir = await this._isEmptyDir(siteRootPath);
    if (!isEmptyDir) {
      throw new Error("Folder was not empty.");
    }
    try {
      const cloneResult = simpleGit().clone(config.url, repositoryPath);
      await cloneResult;
    } catch (e) {
      await fs.remove(siteRootPath);
      throw e;
    }

    let siteConfig: RawSiteConfig = {
      key: config.key,
      name: config.key,
      source: { type: "git", path: config.path, url: config.url, autoSync: config.autoSync||false  },
      publish: [
        //the base use case is just syncing the source - (pushing code) - we don't need to publish anything here by default
      ]
    };

    let configPath = `${pathHelper.getRoot()}config.${config.key}.json`;
    fs.ensureDirSync(pathHelper.getRoot());
    fs.writeFileSync(configPath, JSON.stringify(siteConfig, null, "  "), "utf8");
  }
}
