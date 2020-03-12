export type PublishContext = {
  siteKey: string;
  publishKey: string;
  from: string;
};

export interface IPublisher {
  publish(context: PublishContext): Promise<void>;
}
