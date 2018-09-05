const fs = require('fs-extra');
const path = require('path');

let folderHelper = {

    _readdirPromise: (dirPath) => {
        return new Promise((resolve, reject)=>{
            fs.readdir(dirPath, (e, files)=>{
                if(e){
                    reject(e);
                }
                resolve(files);
            });    
        });
    },

    _lstatPromise: async (filePath)=>{
        return new Promise((resolve, reject)=>{
            fs.lstat(filePath, (e, result)=>{
                if(e){
                    reject(e);
                }
                resolve(result);
            });    
        });
    },

    _buildTreeLevel: async (treeLevel, filePath, options={}) => {
        let files = await folderHelper._readdirPromise(filePath);
        let promises = [];
        for(let i = 0; i < files.length; i++){
            
            let file = files[i];

            let fullFilePath = path.join(filePath, file);
            promises.push(   
                folderHelper._lstatPromise(fullFilePath)
                .then((stat)=>{

                    if(options.includeFunc!==undefined){
                        if(!options.includeFunc(fullFilePath, stat)){
                            return Promise.resolve();    
                        }
                    }

                    if(stat.isDirectory()){
                        let obj = {name:file, files:[]};
                        treeLevel.push(obj);
                        return folderHelper._buildTreeLevel(obj.files, fullFilePath, options);
                    }
                    else{
                        let obj = {name:file};
                        treeLevel.push(obj);
                        return Promise.resolve();
                    }
                })
            );

            await Promise.all(promises);
        }
    },

    getFolderTreeAsync: async (filePath, {includeFunc}={})=>{
        let treeRoot = [];
        await folderHelper._buildTreeLevel(treeRoot, filePath, {includeFunc});
        return treeRoot;
    }
};

module.exports=folderHelper;