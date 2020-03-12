import mainWindowManager from "./main-window-manager";

class OutputConsole {
  appendLine(line: string) {
    let mainWindow = mainWindowManager.getCurrentInstance();
    if (mainWindow) mainWindow.webContents.send("message", { type: "console", data: { line } });
  }
}

export default new OutputConsole();
