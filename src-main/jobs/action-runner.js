/* @flow */

const { BrowserWindow } = require('electron');

class ActionRunner{
    constructor(action /*: string */, params /*: any */){
        this.action = action.replace(/\\/g,'/');
        this.params = params;
    }

    /*:: action : string ; */
    /*:: params : any ; */

    run(){
        let actionWindow = new BrowserWindow({
            show: false,
            backgroundColor:"#ffffff"
        });
        let html = `<html><body><p>Running Action.</p></body></html>`;
        actionWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
        actionWindow.webContents.executeJavaScript(`
const remote = require('electron').remote;
const action = require('${this.action}');

try{
    action(${JSON.stringify(this.params)}).then(()=>{
        remote.getCurrentWindow().close();
    }, ()=>{
        remote.getCurrentWindow().close();
    });
}
catch(e){
    remote.getCurrentWindow().close();
}
`);
        
        return new Promise((resolve, reject)=>{
            actionWindow.on('close', function(){
                resolve();
            });
        });
    }
}

module.exports = ActionRunner;