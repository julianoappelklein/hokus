//@flow

const { execFile } = require('child_process');
const pathHelper = require('./../path-helper');
const fs = require('fs-extra');

/*::
type HugoBuilderConfig = {
    config: string,
    destination: string,
    workspacePath: string,
    hugover: string
}
*/

class HugoBuilder{
    /*::
    config: HugoBuilderConfig;
    */

    constructor(config/*: HugoBuilderConfig*/){
        this.config = config;
    }   

    build(callback/*: (error: any, stdout: any, stderr: any) => void*/){
        
        let hugoArgs = ['--publishDir', this.config.destination ];
        if(this.config.config){ 
            hugoArgs.push('--config');
            hugoArgs.push(this.config.config);
        }

        const exec = pathHelper.getHugoBinForVer(this.config.hugover+"/hugo");
        if(!fs.existsSync(exec)){
            callback('Could not find hugo.exe for version '+this.config.hugover);
            return;
        }
   
        execFile(
            exec,
            hugoArgs,
            {
                cwd: this.config.workspacePath,
                windowsHide: true,
                timeout: 60000, //1 minute
            },
            (error, stdout, stderr) => {
                callback(error, stdout, stderr);
                return;
            }
        );        
    }
}

module.exports = HugoBuilder;