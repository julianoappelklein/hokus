import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Stream } from "stream";
import pathHelper from "./../path-helper";
import * as fs from "fs-extra";
import outputConsole from "./../output-console";
import * as glob from "glob";
import { join } from "path";
import formatProviderResolver from "../format-provider-resolver";
import { appEventEmitter } from "../app-event-emmiter";
import stringArgv from "string-argv";

let currentServerProccess: ChildProcessWithoutNullStreams | undefined;
let currentAuxiliarProccesses: { [key: string]: ChildProcessWithoutNullStreams | undefined } = {};

type ServiceConfig = { command: string; params?: string; cwd?: string };

type HugoServerConfig = {
  config: string;
  hugoServerParams?: string;
  workspacePath: string;
  hugover: string;
  init?: ServiceConfig;
  services: { [key: string]: ServiceConfig };
};

class HugoServer {
  config: HugoServerConfig;

  constructor(config: HugoServerConfig) {
    this.config = config;
  }

  emitLines(stream: Stream) {
    var backlog = "";
    stream.on("data", function(data) {
      backlog += data;
      var n = backlog.indexOf("\n");
      // got a \n? emit one or more 'line' events
      while (~n) {
        stream.emit("line", backlog.substring(0, n));
        backlog = backlog.substring(n + 1);
        n = backlog.indexOf("\n");
      }
    });
    stream.on("end", function() {
      if (backlog) {
        stream.emit("line", backlog);
      }
    });
  }

  stopIfRunning() {
    if (currentServerProccess) {
      currentServerProccess.kill();
      currentServerProccess = undefined;
    }
    if (currentAuxiliarProccesses) {
      for (var key in currentAuxiliarProccesses) {
        currentAuxiliarProccesses[key]?.kill();
        delete currentAuxiliarProccesses[key];
      }
    }
  }

  async serve(): Promise<void> {
    let { config, workspacePath, hugover, hugoServerParams } = this.config;

    this.stopIfRunning();

    const exec = pathHelper.getHugoBinForVer(hugover);

    if (!fs.existsSync(exec)) {
      throw new Error("Could not find hugo.exe for version " + hugover);
    }

    let hugoArgs: string[];
    if (hugoServerParams) {
      hugoArgs = ["server"].concat(stringArgv(hugoServerParams));
    } else {
      hugoArgs = ["server"];
      if (!config) {
        const hugoConfigExp = join(workspacePath, "config.{" + formatProviderResolver.allFormatsExt().join(",") + "}");
        config = (glob.sync(hugoConfigExp) ?? [])[0];
      }

      if (config) {
        hugoArgs.push("--config");
        hugoArgs.push(config);
      }
    }

    try {
      if (this.config.init) {
        await this.runInitService(this.config.init);
      }

      currentAuxiliarProccesses = {};
      currentServerProccess = spawn(exec, hugoArgs, {
        cwd: workspacePath,
        windowsHide: true,
        timeout: undefined,
        env: { $currentHugo: exec }
      });
      let { stdout, stderr } = currentServerProccess;
      this.emitLines(stdout);

      currentServerProccess.stderr.on("data", data => {
        outputConsole.appendLine("Hugo Server Error: " + data);
      });

      currentServerProccess.on("close", code => {
        outputConsole.appendLine("Hugo Server Closed: " + code);
      });

      stdout.setEncoding("utf8");
      stdout.resume();

      let isFirst = true;
      const serverUrlMatcher = /^.+ (http:\/\/localhost:[0-9]+\/) .+$/;
      stdout.on("line", function(line: string) {
        if (isFirst) {
          isFirst = false;
          outputConsole.appendLine("Starting Hugo Server...");
          outputConsole.appendLine("");
          return;
        }
        outputConsole.appendLine(line);
        if (serverUrlMatcher.test(line)) {
          const url = line.replace(serverUrlMatcher, "$1");
          appEventEmitter.emit("onHugoServerStarted", { url });
        }
      });
    } catch (e) {
      outputConsole.appendLine("Hugo Server failed to start.");
      outputConsole.appendLine(e.message);
      this.stopIfRunning();
      throw e;
    }
    for (var key in this.config.services) {
      this.startService(key, this.config.services[key]);
    }
  }

  runInitService(cfg: ServiceConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const key = "__initialization";
      var resolved = false;
      try {
        outputConsole.appendLine(`Running initialization command...`);

        currentAuxiliarProccesses[key] = spawn(cfg.command, stringArgv(cfg.params ?? ""), {
          cwd: cfg.cwd ?? this.config.workspacePath,
          windowsHide: false,
          timeout: 60000
        });

        var process = currentAuxiliarProccesses[key];
        if (process == null) return;
        var stdout = process.stdout;
        stdout.setEncoding("utf8");
        stdout.resume();

        stdout.on("line", function(line: string) {
          outputConsole.appendLine(line);
        });

        stdout.on("data", data => {
          outputConsole.appendLine(data);
        });

        stdout.on("close", (code: any) => {
          outputConsole.appendLine(`Initialization closed: ${code}`);
          if (!resolved) {
            resolve();
            resolved = true;
          }
        });
      } catch (e) {
        if (!resolved) {
          reject(e);
          resolved = true;
        }
      }
    });
  }

  startService(key: string, cfg: ServiceConfig): void {
    try {
      outputConsole.appendLine(`Starting service "${key}"...`);
      const args = stringArgv(cfg.params ?? "");
      currentAuxiliarProccesses[key] = spawn(cfg.command, args, {
        cwd: cfg.cwd ?? this.config.workspacePath,
        timeout: undefined,
        env: {}
      });

      var process = currentAuxiliarProccesses[key];
      
      if (process == null) return;
      var stdout = process.stdout;
      stdout.setEncoding("utf8");
      stdout.resume();

      stdout.on("line", function(line: string) {
        outputConsole.appendLine(line);
      });

      stdout.on("data", data => {
        outputConsole.appendLine(data);
      });

      process.on("close", code => {
        outputConsole.appendLine(`Service "${key}" was closed: ${code}`);
      });
    } catch {
      outputConsole.appendLine(`Failed to start service "${key}".`);
    }
  }
}

export default HugoServer;
