// @flow

const fs = require('fs-extra');
const jimp = require('jimp');
const path = require('path');

const action /* : ( params: { src: string, dest: string }) => Promise<void> */ = async ({src , dest}) => {
    await fs.ensureDir(path.dirname(dest));

    let resizePromise = new Promise((resolve, reject)=>{
        jimp.read(src, function (err, lenna) {
            if (err) reject(err);
            else{
                lenna.resize(56, 56).write(dest, (err) =>{
                    if(err) reject();
                    else resolve();
                });
            }
        });
    });

    await resizePromise;

    let thumbExistsPromise = new Promise((resolve, reject)=>{
        fs.exists(dest,(exists)=> resolve(exists));
    });

    let thumbExists = await thumbExistsPromise;
    if(!thumbExists){
        throw new Error('Something went wrong');
    }
}

module.exports = action;