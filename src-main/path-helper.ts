const userHome = require("user-home");

class PathHelper {
  _lastBuildDir: string | undefined;

  getRoot() {
    return userHome + "/Hokus/";
  }

  getSiteRoot(siteKey: string) {
    return this.getRoot() + `sites/${siteKey}/`;
  }

  getSiteWorkspacesRoot(siteKey: string) {
    return this.getSiteRoot(siteKey) + "workspaces/";
  }

  getSiteWorkspaceRoot(siteKey: string, workspaceKey: string) {
    return this.getSiteWorkspacesRoot(siteKey) + workspaceKey + "/";
  }

  getSiteDefaultPublishDir(siteKey: string, publishKey: string) {
    return this.getSiteRoot(siteKey) + `publish/${publishKey}/`;
  }

  getHugoBinRoot() {
    return this.getRoot() + "tools/hugobin/";
  }

  getHugoBinDirForVer(version: string) {
    return this.getHugoBinRoot() + version + "/";
  }

  getHugoBinForVer(version: string) {
    let platform = process.platform.toLowerCase();
    if (platform.startsWith("win")) {
      return this.getHugoBinDirForVer(version) + "hugo.exe";
    } else {
      return this.getHugoBinDirForVer(version) + "hugo";
    }
  }

  getLastBuildDir(): string | undefined {
    return this._lastBuildDir;
  }

  getBuildDir(siteKey: string, workspaceKey: string, buildKey: string) {
    this._lastBuildDir = this.getSiteRoot(siteKey) + `build/${workspaceKey}/${buildKey}/`;
    return this._lastBuildDir;
  }

  getThemesDir() {
    return this.getRoot() + "tools/hugothemes/";
  }
}

export default new PathHelper();
