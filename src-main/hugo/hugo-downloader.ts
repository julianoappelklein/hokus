import { execFile, ExecException } from "child_process";
import * as fs from "fs-extra";
const mkdirp = require("mkdirp");
import * as glob from "glob";
import * as path from "path";
import * as request from "request";
const { path7za } = require("7zip-bin");
import { EnvironmentResolver, ARCHS, PLATFORMS, Environment } from "./../environment-resolver";
import pathHelper from "../path-helper";
import outputConsole from "../output-console";

export class OfficialHugoSourceUrlBuilder {
  build(Environment: Environment, version: string) {
    let platform;
    let format;
    switch (Environment.platform) {
      case PLATFORMS.linux: {
        platform = "Linux";
        format = "tar.gz";
        break;
      }
      case PLATFORMS.windows: {
        platform = "Windows";
        format = "zip";
        break;
      }
      case PLATFORMS.macOS: {
        platform = "macOS";
        format = "tar.gz";
        break;
      }
      default: {
        throw new Error("Not implemented.");
      }
    }
    let arch;
    switch (Environment.arch) {
      case ARCHS.x32: {
        arch = "32bit";
        break;
      }
      case ARCHS.x64: {
        arch = "64bit";
        break;
      }
      default: {
        throw new Error("Not implemented.");
      }
    }
    version = version.replace(/^v/i, "");
    return `https://github.com/gohugoio/hugo/releases/download/v${version.replace(
      "extended_",
      ""
    )}/hugo_${version}_${platform}-${arch}.${format}`;
  }
}

export class OfficialHugoUnpacker {
  _unpackLinux(packagePath: string) {
    packagePath = path.normalize(packagePath);
    let output = path.dirname(packagePath);
    return new Promise((resolve, reject) => {
      execFile(
        path7za,
        ["e", packagePath, "-o" + output, "*", "-r", "-y"],
        (error: ExecException | null, stdout: string, stderr: string) => {
          if (error) reject(error);
          else resolve();
        }
      );
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          let globExpression = packagePath.replace("download.partial", "download");
          glob(globExpression, (err, matches) => {
            if (err) {
              reject(err);
              return;
            }
            if (matches.length !== 1) {
              reject(new Error(`Expecting one "tar" file, found ${matches.length}.`));
            }
            resolve(matches[0]);
          });
        });
      })
      .then((tarFile: any) => {
        return new Promise((resolve, reject) => {
          execFile(
            path7za,
            ["e", tarFile, "-o" + output, "hugo*", "-r", "-y"],
            (error: ExecException | null, stdout: string, stderr: string) => {
              if (error) {
                reject(error);
                return;
              }
              fs.chmodSync(packagePath.replace("download.partial", "hugo"), 722);
              resolve();
            }
          );
        });
      });
  }

  _unpackWindows(packagePath: string) {
    packagePath = path.normalize(packagePath);
    let output = path.dirname(packagePath);
    return new Promise((resolve, reject) => {
      execFile(
        path7za,
        ["e", packagePath, "-o" + output, "*.exe", "-r", "-y"],
        (error: ExecException | null, stdout: string, stderr: string) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  unpack(packagePath: string, Environment: Environment) {
    switch (Environment.platform) {
      case PLATFORMS.linux:
      case PLATFORMS.macOS: //don't know if this will work
        return this._unpackLinux(packagePath);
      case PLATFORMS.windows:
        return this._unpackWindows(packagePath);
      default:
        throw new Error("Not implemented.");
    }
  }
}

export class HugoDownloader {
  _downloadPromises: { [key: string]: Promise<void> } = {};
  _queue = [];

  async _downloadToFile(url: string, dest: string) {
    let dir = path.dirname(dest);
    let exists = fs.existsSync(dir);
    if (!exists) mkdirp.sync(dir);

    return new Promise((resolve, reject) => {
      let stream = fs.createWriteStream(dest);
      stream.on("finish", () => {
        resolve();
      });

      request
        .get(url)
        .on("error", function(err: Error) {
          reject(err);
        })
        .pipe(stream);
    });
  }

  async download(version: string) {
    if (this._downloadPromises[version] != null) {
      return this._downloadPromises[version];
    }

    this._downloadPromises[version] = (async () => {
      try {
        let bin = pathHelper.getHugoBinForVer(version);
      
        if (fs.existsSync(bin)) {
          delete this._downloadPromises[version];
          return;
        }

        let Environment = new EnvironmentResolver().resolve();
        let url = new OfficialHugoSourceUrlBuilder().build(Environment, version);
        let unpacker = new OfficialHugoUnpacker();
        let tempDest = pathHelper.getHugoBinDirForVer(version) + "download.partial";

        if (fs.existsSync(tempDest)) {
          await fs.unlink(tempDest);
        }

        outputConsole.appendLine(`Hugo installation started. Downloading package from ${url}...`);

        await this._downloadToFile(url, tempDest);

        outputConsole.appendLine(`Unpacking....`);
        await unpacker.unpack(tempDest, Environment);
        await fs.unlink(tempDest);

        outputConsole.appendLine(`Hugo installation completed.`);
        delete this._downloadPromises[version];
      } catch (e) {
        outputConsole.appendLine(`Hugo installation failed.`);
        delete this._downloadPromises[version];
        throw e;
      }
    })();
  }
}

export const hugoDownloader = new HugoDownloader();
