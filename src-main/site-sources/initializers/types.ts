export interface SiteInitializer {
  initialize(config: any): Promise<void>;
}
