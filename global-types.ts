export type ServeConfig = {
  key: string;
  config: string;
};

export type BuildConfig = {
  key: string;
  config: string;
};

export type PublisherConfig<P> = {
  type: string;
} & P;

export type SitePublishConfig<P> = {
  config: PublisherConfig<P>;
  key: string;
};

export type SiteSource<S> = {
  type: string;
} & S;

export type RawSiteConfig = {
  key: string;
  name: string;
  source: SiteSource<any>;
  // transform: Array<SiteTransformConfig<*>>,
  publish: Array<SitePublishConfig<any>>;
};

export type SiteConfig = RawSiteConfig & {
  configPath: string;
  canCreateWorkspaces: boolean;
  canSync: boolean;
};

export type WorkspaceConfigRaw = {
  hugover: string;
  serve: Array<ServeConfig>;
  build: Array<BuildConfig>;
  singles: Array<SingleConfig>;
  collections: Array<CollectionConfig>;
};

export type WorkspaceConfig = WorkspaceConfigRaw & {
  key: string;
  path: string;
};

export type WorkspaceHeader = {
  key: string;
  path: string;
  state: "mounted" | "unmounted";
};

export type SingleConfig = {
  key: string;
  title: string;
  file: string;
  dataformat: string;
  fields: Array<any>;
};

export type CollectionConfig = {
  key: string;
  title: string;
  itemtitle: string;
  fields: Array<any>;
  folder: string;
  extension: string;
  dataformat: string;
};

export type EmptyConfigurations = {
  type: "EmptyConfigurations";
  empty: true;
  fileSearchPatterns: Array<string>;
};

export type Configurations = {
  type: "Configurations";
  sites: Array<SiteConfig>;
  global: {
    siteManagementEnabled: boolean;
    debugEnabled: boolean;
    cookbookEnabled: boolean;
  };
};
