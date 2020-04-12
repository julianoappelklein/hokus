const commandExists = require("command-exists");

class SiteSorceDependencyCheck {
  private async gitCommandExists(): Promise<boolean> {
    try {
      const exists = await commandExists("git");
      return !!exists;
    } catch (e) {
      return false;
    }
  }

  async dependencyCheck(sourceKey: string): Promise<Array<{program: string, exists: boolean}>> {
    const dependencies: Array<{program: string, exists: boolean}> = [];
    if (sourceKey === "git") {
        dependencies.push({ program: "git", exists: await this.gitCommandExists()});
    }
    return dependencies;
  }
}
