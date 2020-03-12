import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Stream } from "stream";
import pathHelper from "./../path-helper";
import * as fs from "fs-extra";
import outputConsole from "./../output-console";

let currentServerProccess: ChildProcessWithoutNullStreams | undefined = undefined;

type HugoServerConfig = {
  config: string;
  workspacePath: string;
  hugover: string;
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
  }

  serve(callback: (error: Error | null) => void) {
    let { config, workspacePath, hugover } = this.config;

    this.stopIfRunning();

    const exec = pathHelper.getHugoBinForVer(hugover);

    if (!fs.existsSync(exec)) {
      callback(new Error("Could not find hugo.exe for version " + hugover));
      return;
    }

    let hugoArgs = ["server"];
    if (config) {
      hugoArgs.push("--config");
      hugoArgs.push(config);
    }

    try {
      currentServerProccess = spawn(exec, hugoArgs, {
        cwd: workspacePath,
        windowsHide: true,
        timeout: undefined,
        env: {}
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
      stdout.on("line", function(line) {
        if (isFirst) {
          isFirst = false;
          outputConsole.appendLine("Starting Hugo Server...");
          outputConsole.appendLine("");
          return;
        }
        outputConsole.appendLine(line);
      });
    } catch (e) {
      outputConsole.appendLine("Hugo Server failed to start.");
      outputConsole.appendLine(e.message);
      callback(e);
    }
    callback(null);
  }
}

export default HugoServer;
