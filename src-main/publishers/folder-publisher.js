//@flow

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');

/*::
import type { IPublisher, PublishContext } from './types';

type FolderPublisherConfig = {
    dest: ?string,
    clean: ?boolean
};

 */

class FolderPublisher/*:: implements IPublisher*/{
    /*::
    _config: FolderPublisherConfig;
    */
    constructor(config/*: FolderPublisherConfig */){
        this._config = config;
    }

    async publish(context/*: PublishContext*/)/*: Promise<void>*/{
        let { dest, clean } = this._config;
        
        let resolvedDest = dest || pathHelper.getSiteDefaultPublishDir(context.siteKey, context.publishKey);
        await fs.ensureDir(resolvedDest);
        let cleanDestBefore = clean===true;
        if(cleanDestBefore){
            await fs.emptyDir(resolvedDest);
        }
        return fs.copy(context.from, resolvedDest);
    }
}

module.exports = FolderPublisher;