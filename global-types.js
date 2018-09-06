//@flow

export type SiteServeConfig={
    env: { [key: string]: string },
    args: Array<string>
};

export type SiteBuildConfig={
    env: string,
    args: Array<string>
};

export type SiteTransformConfig<P>={
    provider:string
}

export type SitePublishConfig<P>={
    provider:string,
    key: string
} & P;


export type RawSiteConfig = {
    key: string,
    name: string,
    source: any,
    serve: Array<SiteServeConfig>,
    build: Array<SiteBuildConfig>,
    transform: Array<SiteTransformConfig<*>>,
    publish: Array<SitePublishConfig<*>>
}

export type SiteConfig = RawSiteConfig & {
    configPath: string
}

export type WorkspaceConfig = {
    singles: Array<SingleConfig>,
    collections: Array<CollectionConfig>,
}

export type WorkspaceHeader = {
    key: string,
    path: string
}

export type SingleConfig = {
    key: string,
    title: string,
    fields: Array<any>
}

export type CollectionConfig = {
    key: string,
    title: string,
    itemtitle: string,
    fields: Array<any>
}

export type Configurations = {
    empty? : bool,
    fileSearchPatterns? : Array<string>,
    sites? : Array<SiteConfig>,
    global:{
        siteManagementEnabled: bool,
        debugEnabled: bool,
        cookbookEnabled: bool
    }
}
