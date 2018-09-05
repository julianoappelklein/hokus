const { spawn } = require('child_process');
const pathHelper = require('./path-helper');
const fs = require('fs-extra');
const outputConsole = require('./output-console');
var readline = require('readline');
let {ipcMain} = require('electron');


let currentServerProccess = undefined;

class HugoServer{
    constructor({hugoArgs, workspacePath, hugover, env, destination}){
        this.hugoArgs = hugoArgs;
        this.workspacePath = workspacePath;
        this.hugover = hugover;
        this.env = env;
        this.destination = destination;
    }   

    _validateHugoArgs(){

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
        for(let i=0; i < this.hugoArgs.length; i++){
            let arg = this.hugoArgs[i];
            arg = arg.trim()
            this.hugoArgs[i] = arg;
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

    serve(callback){

        this.stopIfRunning();

        let validateErrorMessage = this._validateHugoArgs();
        if(validateErrorMessage){
            callback(validateErrorMessage)
            return;
        }
        else{
            this.hugoArgs.unshift('server');

            const exec = pathHelper.getHugoBinForVer(this.hugover);
            fs.exists(exec, (exists) => {
                if(exists){
                    try{
                        
                        currentServerProccess = spawn(
                            exec,
                            this.hugoArgs,
                            {
                                cwd: this.workspacePath,
                                windowsHide: true,
                                timeout: undefined,
                                env: this.env
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
                }
                else{
                    callback('Could not find hugo.exe for version '+this.hugover);
                }
            })
        }
    }
}

module.exports = HugoServer;