//@flow

/*::

    import type { IPublisher } from './types';
    import type { PublisherConfig } from './../types';

    interface IPublisherConfig {
        +provider: string;
    };
*/

//Not a real factory, yet!
class PublisherFactory{
    getPublisher(publisherConfig/*: PublisherConfig<*>*/) /*: IPublisher*/{
        let type = publisherConfig.type;
        let genericPublisherConfig = (publisherConfig/*: any*/);
        if(type==='folder'){
            let FolderPublisher = require('./folder-publisher');
            return new FolderPublisher(genericPublisherConfig);
        }
        if(type==='s3'){
            let S3Publisher = require('./s3-publisher');
            return new S3Publisher(genericPublisherConfig);
        }
        if(type==='void'){
            let VoidPublisher = require('./void-publisher');
            return new VoidPublisher();
        }
        throw new Error(`Publisher of type "${type}" not implemented.`);
    }
}

module.exports = new PublisherFactory();