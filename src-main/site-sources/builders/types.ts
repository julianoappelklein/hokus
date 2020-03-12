export interface SiteSourceBuilder {
    build(config: any): Promise<void>;
}