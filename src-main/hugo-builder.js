const { execFile } = require('child_process');
const pathHelper = require('./path-helper');
const fs = require('fs-extra');

class HugoBuilder{
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

    build(callback){
        let validateErrorMessage = this._validateHugoArgs();
        if(validateErrorMessage){
            callback(validateErrorMessage)
            return;
        }
        else{
            this.hugoArgs.push('--destination');
            this.hugoArgs.push(this.destination);

            const exec = pathHelper.getHugoBinForVer(this.hugover+"/hugo");
            fs.exists(exec, function(exists){
                if(exists){
                    execFile(
                        exec,
                        this.hugoArgs,
                        {
                            cwd: this.workspacePath,
                            windowsHide: true,
                            timeout: 60000, //1 minute
                            env: this.env
                        },
                        (error, stdout, stderr) => {
                            callback(error, stdout, stderr);
                        }
                    );
                }
                else{
                    callback('Could not find hugo.exe for version '+this.hugover);
                }
            }.bind(this))
        }
    }
}

module.exports = HugoBuilder;