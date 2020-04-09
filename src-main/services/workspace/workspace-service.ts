import * as fs from "fs-extra";
import path = require("path");
import glob = require("glob");
import { promisify } from "util";
import { WorkspaceConfig } from "./../../../global-types.js";
import { WorkspaceConfigProvider } from "./workspace-config-provider.js";
import * as contentFormats from "./../../content-formats";
import formatProviderResolver from "../../format-provider-resolver.js";
const workspaceConfigProvider = new WorkspaceConfigProvider();
import { globJob, createThumbnailJob } from "./../../jobs";
import HugoBuilder from "../../hugo/hugo-builder.js";
import pathHelper from "../../path-helper.js";
import HugoServer from "../../hugo/hugo-server.js";
import { appEventEmitter } from "../../app-event-emmiter.js";

class WorkspaceService {
  workspacePath: string;
  workspaceKey: string;
  siteKey: string;

  constructor(workspacePath: string, workspaceKey: string, siteKey: string) {
    this.workspacePath = workspacePath;
    this.workspaceKey = workspaceKey;
    this.siteKey = siteKey;
  }

  //Get the workspace configurations data to be used by the client
  getConfigurationsData(): Promise<WorkspaceConfig> {
    return workspaceConfigProvider.getConfig(this.workspacePath, this.workspaceKey);
  }

  async _smartResolveFormatProvider(filePath: string, fallbacks: Array<string>) {
    let formatProvider;
    if (contentFormats.isContentFile(filePath)) {
      if (fs.existsSync(filePath)) formatProvider = await formatProviderResolver.resolveForMdFilePromise(filePath);
    } else formatProvider = formatProviderResolver.resolveForFilePath(filePath);

    if (formatProvider) return formatProvider;

    if (fallbacks) {
      for (let i = 0; i < fallbacks.length; i++) {
        if (fallbacks[i]) {
          formatProvider = formatProviderResolver.resolveForExtension(fallbacks[i]);
          if (formatProvider) return formatProvider;
        }
      }
    }

    return undefined;
  }

  async _smartDump(filePath: string, formatFallbacks: Array<string>, obj: any) {
    let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
    if (formatProvider === undefined) formatProvider = formatProviderResolver.getDefaultFormat();
    if (contentFormats.isContentFile(filePath)) {
      return formatProvider.dumpContent(obj);
    } else {
      return formatProvider.dump(obj);
    }
  }

  async _smartParse(filePath: string, formatFallbacks: Array<string>, str: string) {
    if (str === undefined || str === null || str.length === 0 || !/\S$/gi) {
      return {};
    }
    let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
    if (formatProvider === undefined) throw new Error("Could not resolve a FormatProvider to parse.");
    if (contentFormats.isContentFile(filePath)) {
      return formatProvider.parseFromMdFileString(str);
    } else {
      return formatProvider.parse(str);
    }
  }

  async getSingle(singleKey: string) {
    let config = await this.getConfigurationsData();
    let single = config.singles.find(x => x.key === singleKey);
    if (single == null) throw new Error("Could not find single.");
    let filePath = path.join(this.workspacePath, single.file);

    if (fs.existsSync(filePath)) {
      let data = fs.readFileSync(filePath, "utf8");
      return await this._smartParse(filePath, [path.extname(single.file).replace(".", "")], data);
    } else {
      return {};
    }
  }

  //Update the single
  async updateSingle(singleKey: string, document: any) {
    let config = await this.getConfigurationsData();
    let single = config.singles.find(x => x.key === singleKey);
    if (single == null) throw new Error("Could not find single.");
    let filePath = path.join(this.workspacePath, single.file);

    let directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) fs.mkdirSync(directory); //ensure directory existence

    this._stripNonDocumentData(document);

    let stringData = await this._smartDump(filePath, [path.extname(single.file).replace(".", "")], document);
    fs.writeFileSync(filePath, stringData);
    appEventEmitter.emit("onWorkspaceFileChanged", {
      siteKey: this.siteKey,
      workspaceKey: this.workspaceKey,
      files: [filePath]
    });
    return document;
  }

  async getResourcesFromContent(filePath: string, currentResources: Array<any> = []) {
    filePath = path.normalize(filePath);
    let directory = path.dirname(filePath);
    let globExp = "**/*";
    let allFiles = await promisify(glob)(globExp, { nodir: true, absolute: false, root: directory, cwd: directory });

    let expression = `_?index[.](${contentFormats.SUPPORTED_CONTENT_EXTENSIONS.join("|")})$`;
    let pageOrSectionIndexReg = new RegExp(expression);
    allFiles = allFiles.filter((x: any) => !pageOrSectionIndexReg.test(x));

    let merged = allFiles.map((src: any) => {
      return Object.assign(
        { src },
        currentResources.find(r => r.src === src)
      );
    });
    return merged;
  }

  async getCollectionItem(collectionKey: string, collectionItemKey: string) {
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    let keyExt = path.extname(collectionItemKey);
    if (collection == null) throw new Error("Could not find collection.");
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    if (fs.existsSync(filePath)) {
      let data = await fs.readFile(filePath, { encoding: "utf8" });
      let obj = await this._smartParse(filePath, [collection.extension], data);
      if (contentFormats.isContentFile(filePath)) {
        obj.resources = await this.getResourcesFromContent(filePath, obj.resources);
      }
      return obj;
    } else {
      return undefined;
    }
  }

  async createCollectionItemKey(collectionKey: string, collectionItemKey: string) {
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if (collection == null) throw new Error("Could not find collection.");
    let filePath;
    let returnedKey;
    if (collection.folder.startsWith("content")) {
      returnedKey = path.join(collectionItemKey, "index." + collection.extension);
      filePath = path.join(this.workspacePath, collection.folder, returnedKey);
    } else {
      returnedKey = collectionItemKey + "." + collection.extension;
      filePath = path.join(this.workspacePath, collection.folder, returnedKey);
    }
    if (fs.existsSync(filePath)) return { unavailableReason: "already-exists" };

    await fs.ensureDir(path.dirname(filePath));
    let stringData = await this._smartDump(filePath, [collection.dataformat], {});
    await fs.writeFile(filePath, stringData, { encoding: "utf8" });
    appEventEmitter.emit("onWorkspaceFileChanged", {
      siteKey: this.siteKey,
      workspaceKey: this.workspaceKey,
      files: [filePath]
    });

    return { key: returnedKey.replace(/\\/g, "/") };
  }

  async listCollectionItems(collectionKey: string) {
    let collection = (await this.getConfigurationsData()).collections.find(x => x.key === collectionKey);

    if (collection == null) throw new Error("Could not find collection.");
    let folder = path.join(this.workspacePath, collection.folder).replace(/\\/g, "/");

    // TODO: make it more flexible! This should not be handled with IF ELSE.
    //  But is good enough for now.

    let supportedContentExt = ["md", "html", "markdown"];
    if (collection.folder.startsWith("content") || supportedContentExt.indexOf(collection.extension) !== -1) {
      let globExpression = path.join(folder, `**/index.{${supportedContentExt.join(",")}}`);
      let files = await globJob(globExpression, {});
      return files.map((item: any) => {
        let key = item.replace(folder, "").replace(/^\//, "");
        let label = key.replace(/^\/?(.+)\/[^\/]+$/, "$1");
        return { key, label };
      });
    } else {
      //data folder and everything else
      let globExpression = path.join(folder, `**/*.{${formatProviderResolver.allFormatsExt().join(",")}}`);
      let files = await globJob(globExpression, {});
      return files.map((item: any) => {
        let key = item.replace(folder, "");
        return { key, label: key };
      });
    }
  }

  _stripNonDocumentData(document: any) {
    for (var key in document) {
      if (key.startsWith("__")) {
        delete document[key];
      }
      if (document.resources) {
        document.resources = document.resources.filter((x: any) => x.__deleted == true);
        document.resources.forEach((x: any) => delete x.__deleted);
      }
    }
  }

  async renameCollectionItem(collectionKey: string, collectionItemKey: string, collectionItemNewKey: string) {
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if (collection == null) throw new Error("Could not find collection.");
    let filePath;
    let newFilePath;
    let newFileKey;
    if (collection.folder.startsWith("content")) {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey);
      newFileKey = path.join(collectionItemNewKey, "index." + collection.extension);
    } else {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey + collection.extension);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey + collection.extension);
      newFileKey = path.join(collectionItemNewKey + "." + collection.extension);
    }

    if (!fs.existsSync(filePath)) {
      return { renamed: false };
    }
    if (fs.existsSync(newFilePath)) {
      return { renamed: false };
    }
    fs.renameSync(filePath, newFilePath);
    appEventEmitter.emit("onWorkspaceFileChanged", {
      siteKey: this.siteKey,
      workspaceKey: this.workspaceKey,
      files: [filePath, newFilePath]
    });
    return { renamed: true, item: { key: newFileKey.replace(/\\/g, "/"), label: collectionItemNewKey } };
  }

  async deleteCollectionItem(collectionKey: string, collectionItemKey: string) {
    //TODO: only work with "label" of a collection item
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if (collection == null) throw new Error("Could not find collection.");
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    if (fs.existsSync(filePath)) {
      //TODO: use async await with a promise to test if deletion succeded
      fs.unlink(filePath);
      appEventEmitter.emit("onWorkspaceFileChanged", {
        siteKey: this.siteKey,
        workspaceKey: this.workspaceKey,
        files: [filePath]
      });
      return true;
    }
    return false;
  }

  async updateCollectionItem(collectionKey: string, collectionItemKey: string, document: any) {
    //TODO: only work with "label" of a collection item
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if (collection == null) throw new Error("Could not find collection.");
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    let directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) fs.mkdirSync(directory); //ensure directory existence

    let documentClone = JSON.parse(JSON.stringify(document));
    this._stripNonDocumentData(documentClone);
    let stringData = await this._smartDump(filePath, [collection.dataformat], documentClone);
    fs.writeFileSync(filePath, stringData);
    
    appEventEmitter.emit("onWorkspaceFileChanged", {
      siteKey: this.siteKey,
      workspaceKey: this.workspaceKey,
      files: [filePath]
    });

    //preparing return
    if (document.resources) {
      for (let r = 0; r < document.resources.length; r++) {
        let resource = document.resources[r];
        if (resource.__deleted) {
          let fullSrc = path.join(directory, resource.src);
          await fs.remove(fullSrc);
        }
      }
      document.resources = document.resources.filter((x: any) => x.__deleted !== true);
    }
    return document;
  }

  async copyFilesIntoCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    files: Array<string>
  ) {
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if (collection == null) throw new Error("Could not find collection.");
    let pathFromItemRoot = path.join(collectionItemKey.replace(/\/[^\/]+$/, ""), targetPath);
    let filesBasePath = path.join(this.workspacePath, collection.folder, pathFromItemRoot);

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      let from = file;
      let to = path.join(filesBasePath, path.basename(file));

      let toExists = fs.existsSync(to);
      if (toExists) {
        fs.unlinkSync(to);
      }

      await fs.copy(from, to);
    }
    if (files.length > 0) {
      appEventEmitter.emit("onWorkspaceFileChanged", {
        siteKey: this.siteKey,
        workspaceKey: this.workspaceKey,
        files: files
      });
    }

    return files.map(x => {
      return path.join(targetPath, path.basename(x)).replace(/\\/g, "/");
    });
  }

  existsPromise(src: string) {
    return new Promise(resolve => {
      fs.exists(src, (exists: boolean) => {
        resolve(exists);
      });
    });
  }

  async getThumbnailForCollectionItemImage(collectionKey: string, collectionItemKey: string, targetPath: string) {
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if (collection == null) throw new Error("Could not find collection.");
    let itemPath = collectionItemKey.replace(/\/[^\/]+$/, "");
    let src = path.join(this.workspacePath, collection.folder, itemPath, targetPath);

    let srcExists = await this.existsPromise(src);
    if (!srcExists) {
      return "NOT_FOUND";
    }

    let thumbSrc = path.join(this.workspacePath, ".hokus/thumbs", collection.folder, itemPath, targetPath);
    let thumbSrcExists = await this.existsPromise(thumbSrc);
    if (!thumbSrcExists) {
      try {
        await createThumbnailJob(src, thumbSrc);
      } catch (e) {
        return "NOT_FOUND";
      }
    }

    let ext = path.extname(thumbSrc).replace(".", "");
    let mime = `image/${ext}`;
    let buffer: any = await promisify(fs.readFile)(thumbSrc);
    let base64 = buffer.toString("base64");

    return `data:${mime};base64,${base64}`;
  }

  _findFirstMatchOrDefault<T extends any>(arr: Array<T>, key: string): T {
    let result;

    if (key) {
      result = (arr || []).find(x => x.key === key);
      if (result) return result;
    }

    result = (arr || []).find(x => x.key === "default" || x.key === "" || x.key == null);
    if (result) return result;

    if (arr !== undefined && arr.length === 1) return arr[0];

    if (key) {
      throw new Error(`Could not find a config for key "${key}" and a default value was not available.`);
    } else {
      throw new Error(`Could not find a default config.`);
    }
  }

  async serve(serveKey: string): Promise<void> {
    let workspaceDetails = await this.getConfigurationsData();
    return new Promise((resolve, reject) => {
      let serveConfig;
      if (workspaceDetails.serve && workspaceDetails.serve.length) {
        serveConfig = this._findFirstMatchOrDefault(workspaceDetails.serve, "");
      } else serveConfig = { config: "" };

      let hugoServerConfig = {
        config: serveConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover
      };

      let hugoServer = new HugoServer(JSON.parse(JSON.stringify(hugoServerConfig)));

      hugoServer.serve(function(err: any) {
        if (err) reject(err);
        else {
          resolve();
        }
      });
    });
  }

  async build(buildKey: string): Promise<void> {
    let workspaceDetails = await this.getConfigurationsData();
    return new Promise((resolve, reject) => {
      let buildConfig;
      if (workspaceDetails.build && workspaceDetails.build.length) {
        buildConfig = this._findFirstMatchOrDefault(workspaceDetails.build, buildKey);
      } else buildConfig = { config: "" };

      let destination = pathHelper.getBuildDir(this.siteKey, this.workspaceKey, buildKey);

      let hugoBuilderConfig = {
        config: buildConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover,
        destination: destination
      };

      let hugoBuilder = new HugoBuilder(hugoBuilderConfig);

      hugoBuilder.build().then(
        () => resolve(),
        (err: any) => reject(err)
      );
    });
  }
}

export default WorkspaceService;
