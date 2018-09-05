//@flow

export type SiteConfig = {
    key: string,
    name: string,
    singles: Array<any>,
    collections: Array<any>,
    source: any
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
    sites? : Array<SiteConfig>
}
