import * as React from "react";
import { Accordion, AccordionItem } from "./../../../components/Accordion";
import { TriggerWithOptions } from "./../../../components/TriggerWithOptions";
import { WorkspaceHeader, SiteConfig } from "./../../../types";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import IconNavigationCheck from "material-ui/svg-icons/navigation/check";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import { InfoLine } from "./shared";
import { WorkspaceConfig } from "./../../../types";

type WorkspaceProps = {
  site: SiteConfig;
  header: WorkspaceHeader;
  active: boolean;
  onLocationClick: (location: string) => void;
  onStartServerClick: (workspace: WorkspaceHeader, serveKey: string) => void;
  onSelectWorkspaceClick: (e: any, siteKey: string, workspace: WorkspaceHeader) => void;
  onPublishClick: (workspaceHeader: WorkspaceHeader, workspace: WorkspaceConfig) => void;
  getWorkspaceDetails: (workspace: WorkspaceHeader) => Promise<WorkspaceConfig>;
};

type WorkspaceState = {
  config?: WorkspaceConfig;
  error?: any;
  refreshing: boolean;
};

export class Workspace extends React.Component<WorkspaceProps, WorkspaceState> {
  constructor(props: WorkspaceProps) {
    super(props);
    this.state = { error: null, refreshing: false };
  }

  handleOnStartServerOptionClick = (event: any, index: number) => {
    let cfg = this.state.config;
    if (cfg == null) throw new Error("Invalid operation");
    this.props.onStartServerClick(this.props.header, cfg.serve[index].key);
    return true;
  };
  handleOpenLocation = () => {
    this.props.onLocationClick(this.props.header.path);
  };
  handleWorkspaceSelect = (e: any) => {
    this.props.onSelectWorkspaceClick(e, this.props.site.key, this.props.header);
  };
  handlePublishClick = () => {
    if (this.state.config != null) this.props.onPublishClick(this.props.header, this.state.config);
  };
  handleRefreshClick = () => {
    this.setState({ error: null, refreshing: true });
    this.load();
  };

  componentDidMount = () => {
    this.load();
  };

  load = () => {
    this.props
      .getWorkspaceDetails(this.props.header)
      .then(config => {
        this.setState({ config, error: null });
      })
      .catch(error => {
        this.setState({ error: error, config: undefined });
      })
      .then(x => {
        setTimeout(() => {
          this.setState({ refreshing: false });
        }, 300);
      });
  };

  render() {
    let { active, header, site } = this.props;
    let { config, error } = this.state;
    let publishDisabled =
      config == null ||
      config.build == null ||
      config.build.length == 0 ||
      site.publish == null ||
      site.publish.length == 0;
    let startServerDisabled = config == null || config.serve == null || config.serve.length == 0;

    return (
      <div style={{ opacity: this.state.refreshing ? 0.5 : 1 }}>
        <InfoLine label="Location">
          <TextField id="location" value={header.path} />
          <FlatButton style={{ minWidth: "40px" }} icon={<IconFileFolder />} onClick={this.handleOpenLocation} />
        </InfoLine>
        {error != null && (
          <InfoLine label="Validation Error">
            <p style={{ color: "#EC407A" }}>{error}</p>
            <FlatButton primary={true} label="Refresh" onClick={this.handleRefreshClick} />
          </InfoLine>
        )}
        <InfoLine childrenWrapperStyle={{ marginTop: "8px" }} label="Actions">
          <RaisedButton
            label="Select"
            disabled={config == null}
            primary={active}
            onClick={this.handleWorkspaceSelect}
          />
          &nbsp;
          <TriggerWithOptions
            triggerType={FlatButton}
            triggerProps={{
              label: "Start Server",
              disabled: startServerDisabled
            }}
            options={config != null && config.serve != null ? config.serve.map(x => x.key || "default") : []}
            onOptionClick={this.handleOnStartServerOptionClick}
          />
          &nbsp;
          <FlatButton label="Publish" disabled={publishDisabled} onClick={this.handlePublishClick} />
        </InfoLine>
      </div>
    );
  }
}

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

  return (
    <Accordion style={{ margin: "0 8px" }}>
      {(workspaces || []).map((workspace, i) => {
        let active = activeSiteKey === site.key && workspace.key === activeWorkspaceKey;
        return (
          <AccordionItem
            key={i}
            label={workspace.key}
            headStyle={{ paddingLeft: "8px", paddingRight: "8px", fontWeight: active ? "bold" : undefined }}
            headerLeftItems={[
              <FlatButton
                style={{ minWidth: "40px" }}
                icon={<IconNavigationCheck />}
                primary={active}
                onClick={e => onSelectWorkspaceClick(e, site.key, workspace)}
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
                getWorkspaceDetails={getWorkspaceDetails}
              />
            }
          />
        );
      })}
    </Accordion>
  );
}
