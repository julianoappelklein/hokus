import fs = require("fs-extra");
import { IPublisher, PublishContext } from "./types";
import pathHelper from "../path-helper";

type FolderPublisherConfig = {
  path?: string;
  clean?: boolean;
};

class FolderPublisher implements IPublisher {
  _config: FolderPublisherConfig;

  constructor(config: FolderPublisherConfig) {
    this._config = config;
  }

  async publish(context: PublishContext): Promise<void> {
    let { path, clean } = this._config;

    let resolvedDest = path || pathHelper.getSiteDefaultPublishDir(context.siteKey, context.publishKey);
    await fs.ensureDir(resolvedDest);
    let cleanDestBefore = clean === true;
    if (cleanDestBefore) {
      await fs.emptyDir(resolvedDest);
    }
    return fs.copy(context.from, resolvedDest);
  }
}

export default FolderPublisher;
