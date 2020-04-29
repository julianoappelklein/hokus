import * as React from "react";
import { Accordion, AccordionItem } from "../../../../components/Accordion";
import { WorkspaceHeader, SiteConfig } from "../../../../types";
import FlatButton from "material-ui/FlatButton";
import IconNavigationCheck from "material-ui/svg-icons/navigation/check";
import { WorkspaceConfig } from "../../../../types";
import { Workspace } from "./Workspace";
import AddWorkspaceDialog from "./AddWorkspaceDialog";

export function Workspaces(props: {
  site: SiteConfig;
  activeSiteKey: string;
  workspaces: Array<WorkspaceHeader>;
  activeWorkspaceKey?: string;
  onLocationClick: (location: string) => void;
  onPublishClick: (workspaceHeader: WorkspaceHeader, workspace: WorkspaceConfig) => void;
  onStartServerClick: (workspace: WorkspaceHeader, config: string) => void;
  onSelectWorkspaceClick: (e: any, siteKey: string, workspace: WorkspaceHeader) => void;
  getWorkspaceDetails: (workspace: WorkspaceHeader) => Promise<WorkspaceConfig>;
  onUnmountedWorkspaceClick?: (workspace: WorkspaceHeader) => void;
  onAddWorkspace?: (workspaceKey: string) => void;
}) {
  let {
    workspaces,
    activeWorkspaceKey,
    activeSiteKey,
    onLocationClick,
    onPublishClick,
    onStartServerClick,
    onSelectWorkspaceClick,
    getWorkspaceDetails,
    site
  } = props;

  const [showAddDialog, setShowAddDialog] = React.useState(false);

  return (
    <React.Fragment>
      <Accordion style={{ margin: "0 8px" }}>
        {(workspaces || [])
          .filter(x => x.state === "mounted")
          .map((workspace, i) => {
            const mounted = workspace.state === "mounted";
            const active = activeSiteKey === site.key && workspace.key === activeWorkspaceKey;
            return (
              <AccordionItem
                key={i}
                label={`${workspace.key} ${!mounted ? "(unmounted)" : ""}`}
                headStyle={{
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  fontWeight: active ? "bold" : undefined
                }}
                headerLeftItems={[
                  <FlatButton
                    style={{ minWidth: "40px" }}
                    icon={<IconNavigationCheck />}
                    secondary={active}
                    onClick={e => {
                      onSelectWorkspaceClick(e, site.key, workspace);
                    }}
                  />
                ]}
                body={
                  <Workspace
                    site={site}
                    active={active}
                    header={workspace}
                    onLocationClick={onLocationClick}
                    onPublishClick={onPublishClick}
                    onStartServerClick={onStartServerClick}
                    onSelectWorkspaceClick={onSelectWorkspaceClick}
                  />
                }
              />
            );
          })}
      </Accordion>
      <div style={{ margin: "8px" }}>
        {site.canCreateWorkspaces && <FlatButton label="Add Workspace" onClick={() => setShowAddDialog(true)} />}
        <AddWorkspaceDialog
          onClose={() => setShowAddDialog(false)}
          open={showAddDialog}
          unmounteWorkspaces={(workspaces || []).filter(x => x.state === "unmounted").map(x => x.key)}
          onSubmit={props.onAddWorkspace}
        />
      </div>
    </React.Fragment>
  );
}
