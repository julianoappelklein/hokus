//TODO: Remove and refactor
export const PLATFORMS = {
  linux: "linux",
  windows: "windows",
  macOS: "macOS"
};

//TODO: Remove and refactor
export const ARCHS = {
  x64: "x64",
  x32: "x32"
};

type SupportedPlatforms = "linux"|"windows"|"macOS";
type SupportedArchs = "x64"|"x32";

export interface Environment{
  platform: SupportedPlatforms;
  arch: SupportedArchs;
}

export class EnvironmentResolver {
  resolve(): Environment {
    const platform: string = process.platform;
    let outPlatform: SupportedPlatforms;
    if (platform.startsWith("win")) {
      outPlatform = "windows";
    } else if (platform.startsWith("linux")) {
      outPlatform = "linux";
    } else if (platform.startsWith("darwin")) {
      outPlatform = "macOS";
    } else {
      throw new Error("Could not resolve environment. Platform not supported.");
    }

    let arch = (ARCHS as any)[process.arch];
    if (arch === undefined) throw new Error("Could not resolve environment. Arch not supported.");

    return { platform: outPlatform, arch };
  }
}