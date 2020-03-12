// const pathHelper = require('./../path-helper');
// const Git = require('nodegit');
// const fs = require('fs-extra');
// const path = require('path');
// const themesRepo = 'https://github.com/gohugoio/hugoThemes.git';


// class HugoThemeProvider{

//     parseModules(modulesString/*: string*/)/*: Array<{url: string}>*/{
//         let matches = modulesString.match(/url = .+?[.]git/gi);
//         if(!matches)
//             throw new Error('Could not find any submodule.');
//         return matches.map(x =>{
//             let url = x.substr(6);
//             let key = url.replace(/^.+[/]([^/]+).git$/,'$1');
//             return { url, key };
//         });
//     }

//     getExtraInfo(){
//         // let data = await getDataPromise();
//         // var jsonData = xmlJs.xml2js(data, {compact: true, spaces: 4});
//         // if(jsonData.rss && jsonData.channel && jsonData.channel.items && jsonData.channel.items.length){
//         //     let transformedData = jsonData.channel.items.map(x => {
//         //         return 1
//         //     });
//         //     return transformedData;    
//         // }
//         // throw new Error('Could not list hugo Templates.')
//     }

//     /*:: cache: any; */
//     async getList() {
        
//         if(this.cache!=null)
//             return this.cache;

//         let themesDir = pathHelper.getThemesDir();

//         try{
//             let gitModulesPath = path.join(themesDir,'.gitmodules');
//             if(!fs.pathExistsSync(gitModulesPath)){
//                 await fs.ensureDir(themesDir);
//                 await Git.Clone(themesRepo, themesDir, {});
//             }
//             let modules = await fs.readFile(gitModulesPath, 'utf8');
//             let parsed = this.parseModules(modules);
//             this.cache = parsed;
//             return parsed;
//         }
//         catch(error){
//             await fs.remove(themesDir);
//             throw error;
//         }
//     }

// }

// function test(){
//     new HugoThemeProvider().getList();
// }
// test();

// module.exports = new HugoThemeProvider();