//@flow

const SiteService = require('./services/site/site-service');
const configurationDataProvider = require('./configuration-data-provider')

class ServiceLocator {
    /*::
    siteServices: { [key: string]: SiteService }
    */
    // async getSiteService(key/*: string */)/*: Promise<SiteService>*/{
    //     let config = await configurationDataProvider.getPromise();
    //     let siteConfig = config.sites.find()
    //     else this.siteServices[key]=new SiteService();
    // }



    async getWorkspaceService(siteKey/*: string*/, workspaceKey/*: string*/){

    }

    async getEventEmitter(){

    }
};