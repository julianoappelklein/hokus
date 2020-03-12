import { IPublisher, PublishContext } from "./types";

class VoidPublisher implements IPublisher {
  publish(context: PublishContext): Promise<void> {
    return Promise.resolve();
  }
}

export default VoidPublisher;
