const userHome = require('user-home');

class PathHelper{
    getRoot(){
        return userHome +'/Hokus/';
    }

    getSiteRoot(siteKey){
        return this.getRoot()+ 'sites/' + siteKey + '/';
    }

    getSiteWorkspacesRoot(siteKey){
        return this.getSiteRoot(siteKey) + 'workspaces/'
    }

    getSiteWorkspaceRoot(siteKey, workspaceKey){
        return this.getSiteWorkspacesRoot(siteKey) + workspaceKey + '/';
    }

    getHugoBinRoot(){
        return this.getRoot() + 'tools/hugobin/';        
    }

    getHugoBinDirForVer(version){
        return this.getHugoBinRoot() + version + '/';
    }

    getHugoBinForVer(version){
        let platform = process.platform.toLowerCase();
        if(platform.startsWith('win')){
            return this.getHugoBinDirForVer(version) + 'hugo.exe';
        }
        else{
            return this.getHugoBinDirForVer(version) + 'hugo';
        }
        
    }

    getBuildDestination(siteKey, workspaceKey){
        return this.getSiteRoot(siteKey) + 'build/' + workspaceKey + '/';
    }
}

module.exports = new PathHelper();