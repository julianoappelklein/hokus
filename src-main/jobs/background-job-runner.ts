import { BrowserWindow, ipcMain } from "electron";
import * as crypto from "crypto";

class BackgroundJobRunner {
  run(action: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const actionWindow = new BrowserWindow({
        show: false, //set it to true if you need to debug the window javascript
        backgroundColor: "#ffffff",
        webPreferences: {
          nodeIntegration: true,
        }
      });
      const html = `<html><body><p>Running Action.</p></body></html>`;
      actionWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

      const channel = crypto.randomBytes(16).toString("hex");
      ipcMain.once(channel, (event: any, { response, e }: any) => {
        actionWindow.close();
        if (!e) resolve(response);
        else reject(e);
      });

      actionWindow.webContents.executeJavaScript(`
let action = require('${action.replace(/\\/g, "/")}');
const { ipcRenderer } = require('electron');
action = action.default||action;

action(${JSON.stringify(params)}).then((response)=>{
    ipcRenderer.send('${channel}', {response,e:null});
},(e)=>{
    ipcRenderer.send('${channel}', {response:null,e});
});
`);
    });
  }
}

export default BackgroundJobRunner;
