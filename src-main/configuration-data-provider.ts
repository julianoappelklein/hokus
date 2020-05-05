import mainWindowManager from "./main-window-manager";
import glob = require("glob");
import * as fs from "fs-extra";
import path = require("path");
import Joi = require("joi");
import { EmptyConfigurations, SiteConfig, Configurations } from "./../global-types";
import formatProviderResolver from "./format-provider-resolver";
import pathHelper from "./path-helper";
import outputConsole from "./output-console";
import { siteSourceFactory } from "./site-sources";
import watch from 'node-watch';

let configurationCache: Configurations | undefined = undefined;

const supportedFormats = formatProviderResolver.allFormatsExt().join(",");
const defaultPathSearchPattern = (pathHelper.getRoot() + "config.{" + supportedFormats + "}").replace(/\\/gi, "/");
const namespacedPathSearchPattern = (pathHelper.getRoot() + "config.*.{" + supportedFormats + "}").replace(/\\/gi, "/");
const globalConfigPattern = (pathHelper.getRoot() + "config.{" + supportedFormats + "}").replace(/\\/gi, "/");

let EMPTY_CFG: EmptyConfigurations = {
  type: "EmptyConfigurations",
  empty: true,
  fileSearchPatterns: [defaultPathSearchPattern, namespacedPathSearchPattern]
};

function normalizeSite(site: SiteConfig): void {}

function validateSite(site: SiteConfig): void {
  if (site == null) {
    throw new Error(`Site config can't be null.`);
  }
  const schema = Joi.object().keys({
    key: Joi.string().required(),
    name: Joi.string().required(),
    source: Joi.object().required(),
    serve: Joi.array(),
    build: Joi.array(),
    publish: Joi.array(),
    transform: Joi.array()
  });
  const result = Joi.validate(site, schema);
  if (result.error) throw result.error;
}

const GLOBAL_DEFAULTS = {
  debugEnabled: false,
  cookbookEnabled: true,
  siteManagementEnabled: true
};

function invalidateCache() {
  configurationCache = undefined;
}

watch(pathHelper.getRoot(), ()=>{
  invalidateCache();
  let mainWindow = mainWindowManager.getCurrentInstance();
  if (mainWindow) mainWindow.webContents.send("message", { type: "config-invalidation", data: { } });
});

async function get({ invalidateCache }: { invalidateCache?: boolean } = {}): Promise<(Configurations|EmptyConfigurations)> {
  if (invalidateCache === true) configurationCache = undefined;

  if (configurationCache) {
    return configurationCache;
  }

  let files = glob
    .sync(defaultPathSearchPattern)
    .concat(glob.sync(namespacedPathSearchPattern))
    .map((x: any) => path.normalize(x));

  let configurations: Configurations = { type: "Configurations", sites: [], global: GLOBAL_DEFAULTS };

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    if (await fs.pathExists(file)) {
      try {
        let strData = fs.readFileSync(file, { encoding: "utf-8" });
        let formatProvider = formatProviderResolver.resolveForFilePath(file);
        if (formatProvider == null) throw new Error(`Could not resolve a format provider for file ${file}.`);
        let site: SiteConfig = formatProvider.parse(strData);
        validateSite(site);
        normalizeSite(site);
        site.configPath = file;
        const siteSource = siteSourceFactory.get(site.key, site.source);
        site.canCreateWorkspaces = siteSource.canCreateWorkspaces();
        site.canSync = siteSource.canSyncWorkspace!=null;
        configurations.sites.push(site);
      } catch (e) {
        outputConsole.appendLine(`Configuration file is invalid '${file}': ${e.toString()}`);
      }
    }
  }

  let globalConfigFile = (glob.sync(globalConfigPattern) || [])[0];
  if (globalConfigFile) {
    try {
      let strData = fs.readFileSync(globalConfigFile, { encoding: "utf-8" });
      let formatProvider = formatProviderResolver.resolveForFilePath(globalConfigFile);
      if (formatProvider == null) throw new Error(`Could not resolve a format provider for "${globalConfigFile}".`);
      let global = formatProvider.parse(strData);
      global = {
        debugEnabled: global.debugEnabled == null ? GLOBAL_DEFAULTS.debugEnabled : global.debugEnabled === true, //default false
        cookbookEnabled:
          global.cookbookEnabled == null ? GLOBAL_DEFAULTS.cookbookEnabled : global.cookbookEnabled === true, //default true
        siteManagementEnabled:
          global.siteManagementEnabled == null
            ? GLOBAL_DEFAULTS.siteManagementEnabled
            : global.siteManagementEnabled === true
      };
      configurations.global = global;
    } catch (e) {
      outputConsole.appendLine(`Global configuration file is invalid '${globalConfigFile}': ${e.toString()}`);
    }
  }

  if (configurations.sites.length > 0) {
    configurationCache = configurations;
    return configurations;
  } else {
    return EMPTY_CFG;
  }
}

export default { get, invalidateCache };
