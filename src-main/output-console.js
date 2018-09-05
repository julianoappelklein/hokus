const mainWindowManager = require('./main-window-manager');

class OutputConsole{
    appendLine(line){
        let mainWindow = mainWindowManager.getCurrentInstance();
        if(mainWindow)
            mainWindow.webContents.send('message',{ type:'console', data:{ line }});
    }
}

module.exports = new OutputConsole();