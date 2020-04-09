import { WorkspaceHeader } from "./../../global-types";

export interface SiteSource {
  initialize?(): void;
  dispose?(): void;
  listWorkspaces(): Promise<Array<WorkspaceHeader>>;
  update(): Promise<void>;
}
