import configurationDataProvider from "../../configuration-data-provider";
const commandExists = require("command-exists");

export interface DependencyStatus {
  program: string;
  exists: boolean;
}

async function gitDependency(): Promise<DependencyStatus> {
  try {
    const exists = await commandExists("gito");
    return { program: "git", exists: exists };
  } catch (e) {
    return { program: "git", exists: false };
  }
}

function getSiteSourceDependencies(siteSourceType: string): Array<Promise<DependencyStatus>> {
  const promises: Promise<DependencyStatus>[] = [];
  if (siteSourceType == "git") {
    promises.push(gitDependency());
  }
  return promises;
}

export async function getSiteSourceDependencyStatus(siteSourceType: string): Promise<Array<DependencyStatus>> {
  return Promise.all(getSiteSourceDependencies(siteSourceType));
}

export async function getSiteDependencyStatus(siteKey: string): Promise<Array<DependencyStatus>> {
  const config = await configurationDataProvider.getPromise();
  if (config.type !== "Configurations") {
    throw new Error("Configuration is not valid.");
  }
  const site = config.sites.find(x => x.key === siteKey);

  let promises: Promise<DependencyStatus>[] = [];

  if (site == null) {
    throw new Error("Site configuration is not valid.");
  }
  promises = promises.concat(getSiteSourceDependencies(site.source.type));

  return Promise.all(promises);
}
