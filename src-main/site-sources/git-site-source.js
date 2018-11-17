// @flow

let pathHelper = require('./../path-helper');
let fs = require('fs-extra');
var Git = require("nodegit");
/*::

import { SiteSource } from './types';
import type { WorkspaceHeader } from './../../global-types';

type GitSiteSourceConfig = {
    key: string,
    credential:{
        sshPrivateKey: string,
        sshPublicKey: string,
        username: string
    },
    url: string
}

*/

class GitSiteSource/*:: implements SiteSource*/ {

    /*:: config: any;*/ 
    
    constructor(config/*: any*/){
        this.config = config;
    }

    async _isEmptyDir(path/*: string*/)/*: Promise<bool>*/{
        return new Promise((resolve, reject)=>{
            fs.readdir(path, function(err, files) {
                if (err) reject(err);
                else resolve(files.length===0);
            });
        });
    }

    async _getRepo()/*: Promise<any>*/{

        let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
        await fs.ensureDir(pathHelper.getSiteRoot(this.config.key));

        if(await this._isEmptyDir(repositoryPath)){
            return Git.Clone(this.config.url, repositoryPath, {
                fetchOpts: {
                    callbacks: {
                        certificateCheck: () => {
                            return 1;
                        },
                        credentials: (url, userName) => {
                            let { username, sshPrivateKey, sshPublicKey } = this.config.credentials;
                            return Git.Cred.sshKeyMemoryNew(userName, sshPublicKey, sshPrivateKey, "");
                        }
                    }
                }
            })
        }
        else{
            return Git.Repository.open(repositoryPath);
        }
    }

    async listWorkspaces()/*: Promise<Array<WorkspaceHeader>>*/{
        let repoNamePrefix = /^(refs\/heads|refs\/remotes\/origin)\//i;
        let repo = await this._getRepo();
        let branches = await repo.getReferenceNames(Git.Reference.TYPE.LISTALL);
        let currentBranchRef = await repo.getCurrentBranch();
        let currentBranchName = currentBranchRef.name().replace(repoNamePrefix,'');

        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }
        branches = branches.map((branch)=> branch.replace(repoNamePrefix,'')).filter(onlyUnique);
        let data = branches.map(branch => ({
            'key': branch,
            'path': pathHelper.getSiteWorkspacesRoot(this.config.key),
            'state': branch===currentBranchName?'mounted':'unmounted'
        }));
        return data;
    }

    async mountWorkspace(key/*: string*/)/*: Promise<bool>*/{
        return false;
    }

    async unmountWorkspace(key/*: string*/)/*: Promise<bool>*/{
        return false;
    }

    async update()/*: Promise<void> */{
        
    }
}

module.exports = GitSiteSource;