import { SiteSourceBuilder } from "./types";
import { RawSiteConfig } from "./../../../global-types";
import * as fs from "fs-extra";
import pathHelper from "../../path-helper";
import ThemeInstaller from "../../hugo/hugo-theme-installer";

type BuildConfig = {
  folderPath: string;
  theme: string;
  key: string;
};

class FolderSiteSourceBuilder implements SiteSourceBuilder {
  constructor() {}

  async build(config: BuildConfig): Promise<void> {
    //create a hokus config
    //create a config

    if (config.theme != null && config.theme) {
      let themeInstaller = new ThemeInstaller();
      await themeInstaller.siteFromTheme(config.theme, config.folderPath);
    }

    let siteConfig: RawSiteConfig = {
      key: config.key,
      name: config.key,
      source: { type: "folder", path: config.folderPath },
      publish: [
        {
          key: "default",
          config: {
            type: "folder", //will publish to a folder
            path: null //will use the default generated path
          }
        }
      ]
    };

    let configPath = `${pathHelper.getRoot()}config.${config.key}.json`;
    fs.ensureDirSync(pathHelper.getRoot());
    fs.writeFileSync(configPath, JSON.stringify(siteConfig, null, "  "), "utf8");
  }
}

export default FolderSiteSourceBuilder;
