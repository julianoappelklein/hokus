import { WorkspaceHeader } from "./../../global-types";

export interface SiteSource {
  //list all workspaces - like branches from a git repository
  listWorkspaces(): Promise<Array<WorkspaceHeader>>;

  //set the active workspace
  mountWorkspace(key: string): Promise<void>;

  //prepare to switch to another workspace
  unmountWorkspace(key: string): Promise<void>;

  update(): Promise<void>;
}
