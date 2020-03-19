import fs = require("fs-extra");
import path = require("path");
import glob = require("glob");
import { WorkspaceConfig } from "../../../global-types";
import { FileCacheToken } from "./file-cache-token";
import formatProviderResolver from "../../format-provider-resolver";
import InitialWorkspaceConfigBuilder from "./initial-workspace-config-builder";
import WorkspaceConfigValidator from "./workspace-config-validator";

export class WorkspaceConfigProvider {
  cache: { [key: string]: { token: FileCacheToken; config: any } };

  constructor() {
    this.cache = {};
  }

  async getConfig(
    workspacePath: string,
    workspaceKey: string
  ): Promise<WorkspaceConfig & { path: string; key: string }> {
    let filePath = this._getFilePath(workspacePath);
    const cacheKey = `${filePath}-${workspaceKey}`;
    let config: WorkspaceConfig;

    if (filePath != null) {
      const cached = this.cache[cacheKey];
      const token = await new FileCacheToken([filePath]).build();

      if (cached != null) {
        if (await cached.token.match(token)) {
          //can be reused
          return cached.config;
        }
      }

      let config = this._loadConfigurationsData(filePath, workspaceKey);
      config.path = workspacePath;
      config.key = workspaceKey;
      this.cache[cacheKey] = { token, config };
      return config;
    } else {
      // need to build default config and update cache
      const newConfig = this._buildDefaultConfig(workspacePath);
      config = newConfig.config;
      filePath = newConfig.path;
      const token = await new FileCacheToken([filePath]).build();
      config.path = workspacePath;
      config.key = workspaceKey;
      this.cache[cacheKey] = { token, config };
      return config;
    }
  }

  _getFilePath(workspacePath: string) {
    let fileExp = path.join(workspacePath, "hokus.{" + formatProviderResolver.allFormatsExt().join(",") + "}");
    return glob.sync(fileExp)[0];
  }

  _buildDefaultConfig(workspacePath: string): { config: WorkspaceConfig; path: string } {
    let configBuilder: any = new InitialWorkspaceConfigBuilder(workspacePath);
    let { data, formatProvider } = configBuilder.build();
    let filePath = path.join(workspacePath, "hokus." + formatProvider.defaultExt());
    fs.writeFileSync(filePath, formatProvider.dump(data));
    return { config: data, path: filePath };
  }

  _loadConfigurationsData(filePath: string, workspaceKey: string): WorkspaceConfig {
    let strData = fs.readFileSync(filePath, "utf8");
    let formatProvider = formatProviderResolver.resolveForFilePath(filePath);
    if (formatProvider == null) {
      formatProvider = formatProviderResolver.getDefaultFormat();
    }
    let returnData = formatProvider.parse(strData);

    let validator = new WorkspaceConfigValidator();
    let result = validator.validate(returnData);
    if (result) throw new Error(result);

    return returnData;
  }
}
