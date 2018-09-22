//@flow
let Git = require('nodegit');
let fs = require('fs-extra');
let path = require('path');

class ThemeInstaller{
    constructor(){}

    async siteFromTheme(repoUrl/*: string*/, destPath/*:string*/, options/*:?{ force: bool }*/ = null)
    {
        let opts = Object.assign({}, { force:false }, options);

        if(fs.existsSync(destPath)){
            let files = await fs.readdir(destPath);
            if(files.length>0){
                if(opts.force)
                    await fs.emptyDir(destPath);
                else
                    throw new Error('Directory is not empty.');
            }
        }

        let themeKey = repoUrl.replace(/^.+[/]([^/]+).git$/,'$1');
        let themePath = path.join(destPath, 'themes', themeKey);
        await fs.ensureDir(themePath);
        

        await Git.Clone(repoUrl, themePath);
        
        //copy "sample" or "example" site to dest
        let sampleSitesPath = ['exampleSite','sampleSite'].map(x => path.join(themePath, x));
        for(let i = 0; i < sampleSitesPath.length; i++){
            let sampleSitePath = sampleSitesPath[i];
            if(fs.existsSync(sampleSitePath)){
                await fs.copy(sampleSitePath, destPath);
                break;
            }
        }

        //remove .git folder
        let gitFolder = path.join(destPath, '.git');
        await fs.remove(gitFolder);
    }
}

module.exports = ThemeInstaller;

// async function test(){
//     let themeInstaller = new ThemeInstaller();
//     await themeInstaller.siteFromTheme('https://github.com/aerohub/hugo-orbit-theme.git','D:\\temp\\hugo-sites\\my-site', {force:true});
// }
// test();