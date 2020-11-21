export type Keyed = {
  key: string;
}

export type ServeConfig = {
  config: string;
} & Keyed;

export type BuildConfig = {
  config: string;
} & Keyed;

export type PublisherConfig<P> = {
  type: string;
} & P;

export type SitePublishConfig<P> = {
  config: PublisherConfig<P>;
} & Keyed;

export type SiteSource<S> = {
  type: string;
} & S;

export type RawSiteConfig = {
  name: string;
  source: SiteSource<any>;
  // transform: Array<SiteTransformConfig<*>>,
  publish: Array<SitePublishConfig<any>>;
} & Keyed;

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
  path: string;
} & Keyed;

export type WorkspaceHeader = {
  path: string;
  state: "mounted" | "unmounted";
} & Keyed;

export type SingleConfig = {
  title: string;
  file: string;
  dataformat: string;
  fields: Array<any>;
} & Keyed;

export type CollectionConfig = {
  title: string;
  itemtitle: string;
  fields: Array<any>;
  folder: string;
  extension: string;
  dataformat: string;
} & Keyed;

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
