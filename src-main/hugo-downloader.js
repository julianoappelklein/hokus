const { execFile } = require('child_process');
const fs = require('fs-extra');
const mkdirp = require("mkdirp");
const path = require("path");
const glob = require("glob");
const pathHelper = require('./path-helper');
const {path7za} = require("7zip-bin");
const request = require('request');
const outputConsole = require('./output-console');
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./environment-resolver');

class OfficialHugoSourceUrlBuilder{
    build(enviromnent, version){
        let platform;
        let format;
        switch(enviromnent.platform){
            case PLATFORMS.linux: { platform = 'Linux'; format = 'tar.gz'; break; }
            case PLATFORMS.windows: { platform = 'Windows'; format = 'zip'; break; }
            case PLATFORMS.macOS: { platform = 'macOS'; format = 'tar.gz'; break; }
            default:{ throw new Error('Not implemented.') }
        }
        let arch;
        switch(enviromnent.arch){
            case ARCHS.x32: { arch = '32bit'; break; }
            case ARCHS.x64: { arch = '64bit'; break; }
            default:{ throw new Error('Not implemented.') }
        }
        version = version.replace(/^v/i,'');
        return `https://github.com/gohugoio/hugo/releases/download/v${version}/hugo_${version}_${platform}-${arch}.${format}`;
    }
}

class OfficialHugoUnpacker{

    _unpackLinuxMac(packagePath){
        packagePath = path.normalize(packagePath);
        let output = path.dirname(packagePath);
        return new Promise((resolve,reject)=>{
            execFile(path7za, ['e', packagePath, '-o'+output, '*.tar', '-r', '-y' ], (error, stdout, stderr)=>{
                if(error) reject(error);
                else resolve();
            });
        }).then(()=>{
            return new Promise((resolve, reject)=>{
                glob('*.tar', (err, matches)=>{
                    if(err){reject(err); return; }
                    if(matches.length!==1){ reject(new Error(`Expecting one "tar" file, found ${matches.length}.`)); }
                    resolve(matches[0]);
                })
            });
        }).then((tarFile)=>{
            return new Promise((resolve, reject)=>{
                execFile(path7za, ['e', tarFile, '-o'+output, 'hugo*', '-r', '-y' ], (error, stdout, stderr)=>{
                    if(error) reject(error);
                    else resolve();
                });
            });
        });
    }

    _unpackWindows(packagePath){
        packagePath = path.normalize(packagePath);
        let output = path.dirname(packagePath);
        return new Promise((resolve,reject)=>{
            execFile(path7za, ['e', packagePath, '-o'+output, '*.exe', '-r', '-y' ], (error, stdout, stderr)=>{
                if(error)
                    reject(error);
                else
                    resolve();
            });
        });
    }

    unpack(packagePath, enviromnent){
        switch(enviromnent.platform){
            case PLATFORMS.linux:
            case PLATFORMS.macOS:
                return this._unpackLinuxMac(packagePath);
            case PLATFORMS.windows:
                return this._unpackWindows(packagePath);
            default:
                throw new Error('Not implemented.');
        }
    }    
}

class HugoDownloader{

    constructor(){
        this._isRunning = false;
        this._queue = [];
    }

    async _downloadToFile(url, dest){
        
        let dir = path.dirname(dest);
        let exists = fs.existsSync(dir);
        if(!exists)
            mkdirp.sync(dir);

        return new Promise((resolve, reject) =>{
            let stream = fs.createWriteStream(dest);
            stream.on('finish', () => {
                resolve();
            });

            request.get(url)
            .on('error', function(err) {
              reject(err);
            })
            .pipe(stream)
        });
    }

    async download(version){

        if(this._isRunning){ return; }

        let bin = pathHelper.getHugoBinForVer(version);
        if(fs.existsSync(bin)){
            return;
        }

        this._isRunning = true;

        try{
            let enviromnent = new EnvironmentResolver().resolve();
            let url = new OfficialHugoSourceUrlBuilder().build(enviromnent,version);
            let unpacker = new OfficialHugoUnpacker();
            let tempDest = pathHelper.getHugoBinDirForVer(version) + 'download.partial';

            
            if(fs.existsSync(tempDest)){
                await fs.unlink(tempDest)
            }
            
            outputConsole.appendLine(`Hugo download started. Downloading from ${url}.`);

            await this._downloadToFile(url, tempDest);
            await unpacker.unpack(tempDest, enviromnent);
            await fs.unlink(tempDest);

            outputConsole.appendLine(`Hugo download completed.`);
            this._isRunning = false;
        }
        catch(e){
            this._isRunning = false;
            return e;
        }
    }
}

module.exports = {
    downloader: new HugoDownloader(),
    HugoDownloader: HugoDownloader,
    OfficialHugoSourceUrlBuilder,
    OfficialHugoUnpacker
}