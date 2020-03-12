import { IPublisher } from "./types";
import { PublisherConfig } from "./../types";
import FolderPublisher from "./folder-publisher";
import S3Publisher from "./s3-publisher";

//Not a real factory, yet!
class PublisherFactory {
  getPublisher(publisherConfig: PublisherConfig<any>): IPublisher {
    let type = publisherConfig.type;
    let genericPublisherConfig = publisherConfig as any;
    if (type === "folder") {
      return new FolderPublisher(genericPublisherConfig);
    }
    if (type === "s3") {
      return new S3Publisher(genericPublisherConfig);
    }
    if (type === "void") {
      let VoidPublisher = require("./void-publisher");
      return new VoidPublisher();
    }
    throw new Error(`Publisher of type "${type}" not implemented.`);
  }
}

export default new PublisherFactory();
