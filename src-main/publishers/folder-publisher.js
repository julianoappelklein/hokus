//@flow

const fs = require('fs-extra');

/*::
import type { IPublisher } from './types';

type FolderPublisherConfig = {
    dest: string,
};

 */

class FolderPublisher/*:: implements IPublisher*/{
    /*::
    _config: FolderPublisherConfig;
    */
    constructor(config/*: FolderPublisherConfig */){
        this._config = config;
    }

    publish(path/*: string*/, callback/*: (error: ?Error)=>void*/)/*: void*/{
    }
}