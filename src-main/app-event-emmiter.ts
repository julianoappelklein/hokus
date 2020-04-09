import { EventEmitter2 } from "eventemitter2";
import TypedEventEmitter from "./shared/typed-event-emmiter";
import { EventEmitter } from "events";

const eventEmitter2 = new EventEmitter2({ wildcard: true });

interface SiteEvent {
  siteKey: string;
}

interface WorkspaceEvent extends SiteEvent {
  workspaceKey: string;
}

interface WorkspaceFileChangedEvent extends WorkspaceEvent {
  files: string[];
}

interface AppEvents {
  onWorkspaceFileChanged: (payload: WorkspaceFileChangedEvent) => void;
}

export interface AppEventEmitter extends TypedEventEmitter<AppEvents> {}

const _eventEmitter2 = new EventEmitter2();
export const appEventEmitter = eventEmitter2 as AppEventEmitter;
