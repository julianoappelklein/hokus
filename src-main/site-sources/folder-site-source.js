// @flow
/*::
import { SiteSource } from './types';
*/

class FolderSiteSource/*:: implements SiteSource*/ {
    
    constructor(config/*: any*/){
        
    }

    fetchFromSource(){
        //The workspace and the source are the same. We don't need to fetch the workspace.
    }

    updateFromSource(){
        //The workspace and the source are the same. We don't need to update the workspace.
    }

    localIsUpdated(){
        //Yeah, always true
        return true;
    }

    pushLocalToSource(){
        //The workspace and the source are the same. We don't need to update the source.
    }
    
    canCreateLocal(){
        return false; //the source is the local! Duh
    }
}

module.exports = FolderSiteSource;