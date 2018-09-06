//@flow

/*::

    import type { IPublisher } from './types';

    interface IPublisherConfig {
        +provider: string;
    };
*/

//Not a real factory, yet!
class PublisherFactory{
    getPublisher(publisherConfig/*: IPublisherConfig*/) /*: IPublisher*/{
        let provider = publisherConfig.provider;
        let genericPublisherConfig = (publisherConfig/*: any*/);
        if(provider==='s3'){
            let S3Publisher = require('./s3-publisher');
            return new S3Publisher(genericPublisherConfig);
        }
        throw new Error(`Publisher of type "${provider}" not implemented.`);
    }
}

module.exports = new PublisherFactory();