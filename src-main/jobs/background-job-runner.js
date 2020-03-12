/* @flow */

const { BrowserWindow, ipcMain } = require('electron');
const crypto = require("crypto");

class BackgroundJobRunner {

    run(action /*: string */, params /*: any */) /*: Promise<any> */ {
        return new Promise((resolve, reject) => {
            let actionWindow = new BrowserWindow({
                show: false,
                backgroundColor: "#ffffff"
            });
            let html = `<html><body><p>Running Action.</p></body></html>`;
            actionWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

            let channel = crypto.randomBytes(16).toString("hex");
            ipcMain.once(channel, (event, { response, e }) => {
                actionWindow.close();
                if (e == null)
                    resolve(response);
                else
                    reject(e);
            });

            actionWindow.webContents.executeJavaScript(`
const action = require('${action.replace(/\\/g, '/')}');
const { ipcRenderer } = require('electron');

action(${JSON.stringify(params)}).then((response)=>{
    ipcRenderer.send('${channel}', {response,e:null});
},(e)=>{
    ipcRenderer.send('${channel}', {response:null,e});
});
`);
        });
    }
}

module.exports = BackgroundJobRunner;