//@flow

export type ServeConfig={
    key: string,
    config: string
};

export type BuildConfig={
    key: string,
    config: string
};

export type SitePublishConfig<P>={
    type:string,
    key: string
} & P;


export type RawSiteConfig = {
    key: string,
    name: string,
    source: any,
    // transform: Array<SiteTransformConfig<*>>,
    publish: Array<SitePublishConfig<*>>
}

export type SiteConfig = RawSiteConfig & {
    configPath: string
}

export type WorkspaceConfigRaw = {
    hugover: string,
    serve:Array<ServeConfig>,
    build:Array<BuildConfig>,
    singles: Array<SingleConfig>,
    collections: Array<CollectionConfig>,
}

export type WorkspaceConfig = WorkspaceConfigRaw & {
    key: string,
    path: string
}

export type WorkspaceHeader = {
    key: string,
    path: string
}

export type SingleConfig = {
    key: string,
    title: string,
    file: string,
    fields: Array<any>
}

export type CollectionConfig = {
    key: string,
    title: string,
    itemtitle: string,
    fields: Array<any>,
    folder: string,
    extension: string,
    dataformat: string
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
