//Not a real factory, yet!
class PublisherFactory{

    getPublisher(publishConfig){
        let S3Publisher = require('./s3-publisher')
        return new S3Publisher(publishConfig);

    }
}

module.exports = new PublisherFactory();