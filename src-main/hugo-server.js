//@flow

const { spawn } = require('child_process');
const pathHelper = require('./path-helper');
const fs = require('fs-extra');
const outputConsole = require('./output-console');
var readline = require('readline');
let {ipcMain} = require('electron');


let currentServerProccess = undefined;

/*::
type HugoServerConfig = {
    hugoArgs: Array<string>,
    workspacePath: string,
    hugover: string,
    env: any,
    destination: string
}
*/

class HugoServer{

    /*::
    config: HugoServerConfig;
    */

    constructor(config/*: HugoServerConfig*/){
        this.config = config;
    }   

    _validateHugoArgs(){

        let {hugoArgs} = this.config;

        //TODO: do some real validation do prevent damages!
        // The validation should consider the Hugo version

        const forbiddenFlags = [
            '--cacheDir',
            '--contentDir',
            '-d',
            '--destination',
            '-h',
            '--help',
            '-l',
            '--layoutDir',
            '-s',
            '--source',
            '--themesDir',
            '--watch'
        ];

        const relativeOnlyFlags = [
        ];

        let invalidMessage;
        for(let i=0; i < hugoArgs.length; i++){
            let arg = hugoArgs[i];
            arg = arg.trim()
            hugoArgs[i] = arg;
            let isFlag = arg.startsWith('-');
            if(isFlag){
                for(let f=0; f < forbiddenFlags.length; f++){
                    let flag = forbiddenFlags[f];
                    if(arg === flag){
                        invalidMessage = 'The hugo flag '+ flag + ' is forbidden.';
                        break;
                    }
                    if(invalidMessage)
                        break;
                }
            }
        }
        
        return invalidMessage;
    }

    emitLines (stream) {
        var backlog = ''
        stream.on('data', function (data) {
            backlog += data
            var n = backlog.indexOf('\n')
            // got a \n? emit one or more 'line' events
            while (~n) {
            stream.emit('line', backlog.substring(0, n))
            backlog = backlog.substring(n + 1)
            n = backlog.indexOf('\n')
            }
        })
        stream.on('end', function () {
            if (backlog) {
                stream.emit('line', backlog)
            }
        })
    }
    

    stopIfRunning(){
        if(currentServerProccess){
            currentServerProccess.kill();
            currentServerProccess = undefined;
        }
    }

    serve(callback/*: (error: ?Error)=>void*/){

        let {hugoArgs, workspacePath, hugover, env, destination} = this.config;

        this.stopIfRunning();

        let validateErrorMessage = this._validateHugoArgs();
        if(validateErrorMessage){
            callback(validateErrorMessage)
            return;
        }
        else{
            hugoArgs.unshift('server');

            const exec = pathHelper.getHugoBinForVer(hugover);
            fs.exists(exec, (exists) => {
                if(!exists){
                    callback(new Error('Could not find hugo.exe for version '+ hugover));
                    return;
                }
                try{
                    
                    currentServerProccess = spawn(
                        exec,
                        hugoArgs,
                        {
                            cwd: workspacePath,
                            windowsHide: true,
                            timeout: undefined,
                            env: env
                        }
                    );
                    let {stdout} = currentServerProccess;
                    this.emitLines(stdout);
                    stdout.setEncoding('utf8');
                    stdout.resume();

                    let isFirst = true;
                    stdout.on('line', function (line) {
                        if(isFirst){
                            isFirst=false;
                            outputConsole.appendLine('Starting Hugo Server...');
                            outputConsole.appendLine('');
                            return;
                        }
                        outputConsole.appendLine(line);
                    });                        
                    
                }
                catch(e){
                    callback(e);
                }
            })
        }
    }
}

module.exports = HugoServer;