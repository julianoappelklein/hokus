// @flow

/*
    NodeGit Examples:
    https://github.com/nodegit/nodegit/tree/master/examples
*/

let pathHelper = require('./../path-helper');
let fs = require('fs-extra');
var NodeGit = require('nodegit');
let jobManager = require('./../jobs/job-manager');
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

    _getNodeGitFetchOptions(){
        return {
            callbacks: {
                certificateCheck: () => {
                    return 1;
                },
                credentials: (url /*: string */, userName /*: string */) => {
                    let { sshPrivateKey, sshPublicKey } = this.config.credentials;
                    return NodeGit.Cred.sshKeyMemoryNew(userName, sshPublicKey, sshPrivateKey, "");
                }
            }
        };
    }

    async _getRepo()/*: Promise<any>*/{

        let repositoryPath = pathHelper.getSiteWorkspacesRoot(this.config.key);
        let siteRootPath = pathHelper.getSiteRoot(this.config.key);
        fs.ensureDir(siteRootPath);

        if(await this._isEmptyDir(siteRootPath)){
            return NodeGit.Clone(this.config.url, repositoryPath, { fetchOpts: this._getNodeGitFetchOptions() })
        }
        else{
            return NodeGit.Repository.open(repositoryPath);
        }
    }

    async listWorkspaces()/*: Promise<Array<WorkspaceHeader>>*/{
        return jobManager.runSharedJob(
            `git-site-source:list-workspaces:${this.config.key}`,
            async ()=>{

                let repoNamePrefix = /^(refs\/heads|refs\/remotes\/origin)\//i;
                let repo = await this._getRepo();
                let branches = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
                let currentBranchRef = await repo.getCurrentBranch();
                let currentBranchName = currentBranchRef.name().replace(repoNamePrefix,'');

                jobManager.runSharedJob(
                    `git-site-source:fetch:${this.config.key}`,
                    ()=> repo.fetch('origin', this._getNodeGitFetchOptions())
                );

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
        );
    }

    async mountWorkspace(key/*: string*/)/*: Promise<void>*/{
        let repo = await this._getRepo();
        let branches = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
        let refName = branches.find(x => x.endsWith('/'+key) && x.indexOf('/remotes/')!==-1);
        if(refName==null)
            refName = branches.find(x => x.endsWith('/'+key));
        let ref = await repo.getBranch(refName);
        await repo.checkoutRef(ref);

        //do a regular pull

        //let remote = await NodeGit.Remote.create(repo, "origin", this.config.url);
        // await repo.pull(this._getNodeGitFetchOptions());
        // await repo.push(this._getNodeGitFetchOptions());
        return undefined;
        
    }

    async unmountWorkspace(key/*: string*/)/*: Promise<void>*/{
        //won't be necessary
    }

    async update()/*: Promise<void> */{
        //huuumm...
    }
}

module.exports = GitSiteSource;