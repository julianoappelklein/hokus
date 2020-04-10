const _fs = require("fs");
import * as fs from "fs-extra";
import * as glob from "glob";
import * as path from "path";
import * as simpleGit from 'simple-git/promise';
import formatProviderResolver from "../format-provider-resolver";

class ThemeInstaller {
  constructor() {}

  async siteFromTheme(repoUrl: string, destPath: string, options?: { force: boolean }) {
    let opts = Object.assign({}, { force: false }, options);

    if (fs.existsSync(destPath)) {
      let files = await fs.readdir(destPath);
      if (files.length > 0) {
        if (opts.force) await fs.emptyDir(destPath);
        else throw new Error("Directory is not empty.");
      }
    }

    let themeKey = repoUrl.replace(/^.+[/]([^/]+).git$/, "$1");
    let themePath = path.join(destPath, "themes", themeKey);
    await fs.ensureDir(themePath);

    await simpleGit().clone(repoUrl, themePath);

    //copy "sample" or "example" site to dest
    let sampleSitesPath = ["exampleSite", "sampleSite"].map(x => path.join(themePath, x));
    let sampleSiteCopied = false;
    for (let i = 0; i < sampleSitesPath.length; i++) {
      let sampleSitePath = sampleSitesPath[i];
      if (fs.existsSync(sampleSitePath)) {
        await fs.copy(sampleSitePath, destPath);
        sampleSiteCopied = true;
        break;
      }
    }

    //ajust Hugo config to point to the default themes
    if (sampleSiteCopied) {
      let hugoConfigExpression = path.join(destPath, `config.{${formatProviderResolver.allFormatsExt().join(",")}}`);
      let hugoConfigPath = glob.sync(hugoConfigExpression)[0];
      if (hugoConfigPath) {
        let hugoConfigStr = await fs.readFile(hugoConfigPath, "utf8");
        let formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigPath);
        if (formatProvider == null) throw new Error("Could not resolve a format provider.");
        let hugoConfig = formatProvider.parse(hugoConfigStr);
        if (hugoConfig.themesDir || hugoConfig.theme != themeKey) {
          delete hugoConfig.themesDir;
          hugoConfig.theme = themeKey;
          //we need to override the configuration
          await fs.writeFile(hugoConfigPath, formatProvider.dump(hugoConfig), "utf8");
        }
      }
    }

    //remove .git folder
    let gitFolder = path.join(destPath, ".git");
    await fs.remove(gitFolder);
  }
}

export default ThemeInstaller;

// async function test(){
//     let themeInstaller = new ThemeInstaller();
//     await themeInstaller.siteFromTheme('https://github.com/digitalcraftsman/hugo-creative-theme.git','D:\\temp\\hugo-sites\\my-site', {force:true});
// }
// test();

/*
Tested with:
    - https://github.com/budparr/gohugo-theme-ananke.git
    - https://github.com/aerohub/hugo-identity-theme.git
    - https://github.com/aerohub/hugo-orbit-theme.git
    - https://github.com/aerohub/hugrid.git
    - https://github.com/gcushen/hugo-academic.git
    - https://github.com/digitalcraftsman/hugo-creative-theme.git
*/
