import * as React from "react";
import { Wrapper, InfoLine, InfoBlock } from "../shared";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import { FlatButton, TextField } from "material-ui";
import { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from "../../../../../global-types";
import service from "../../../../services/service";
import muiThemeable from "material-ui/styles/muiThemeable";
import { MuiTheme } from "material-ui/styles";
import { Workspaces } from "./Workspaces";
import PublishSiteDialog from "../PublishSiteDialog";
import { snackMessageService, blockingOperationService } from "../../../../services/ui-service";

interface Props {
  activeSiteKey: string;
  activeWorkspaceKey: string;
  configurations: Configurations;
  site: SiteConfig;
  muiTheme?: MuiTheme;
  onSelectWorkspace: (e: any, siteKey: string, workspace: WorkspaceHeader) => void;
}

interface State {
  selectedSiteDependencies?: Array<{ program: string; exists: boolean }>;
  selectedSiteWorkspaces?: Array<WorkspaceHeader>;
  publishSiteDialog?: { workspace: WorkspaceConfig; workspaceHeader: WorkspaceHeader; open: boolean };
}

class SiteDetails extends React.Component<Props, State> {
  state: State = {};

  componentDidMount() {
    const siteKey = this.props.site.key;
    service.api.getSiteDependencyStatus(siteKey).then(selectedSiteDependencies => {
      this.setState({ selectedSiteDependencies });
    });
    service.api.listWorkspaces(siteKey).then(workspaces => {
      this.setState({ selectedSiteWorkspaces: workspaces });
    });
  }

  handleBuildAndPublishClick = ({ siteKey, workspaceKey, build, publish }: any) => {
    const operationKey = `build-and-publish-${siteKey}`;
    blockingOperationService.startOperation({ key: operationKey, title: "Building site..." });
    service.api
      .buildWorkspace(siteKey, workspaceKey, build)
      .then(() => {
        blockingOperationService.startOperation({ key: operationKey, title: "Publishing site..." });
        return service.api.publishSite(siteKey, publish);
      })
      .then(() => {
        snackMessageService.addSnackMessage("Site successfully published.");
      })
      .catch(() => {
        snackMessageService.addSnackMessage("Publish failed.");
      })
      .then(() => {
        blockingOperationService.endOperation(operationKey);
      });
  };

  render() {
    const { site, configurations } = this.props;
    const dependencies = (this.state.selectedSiteDependencies || [])
      .filter(x => x.exists === false)
      .map(x => x.program);
    return (
      <Wrapper style={{ maxWidth: "1000px" }} key={site.key} title="Site Management">
        <InfoLine label="Name">{site.name}</InfoLine>
        <InfoLine label="Key">{site.key}</InfoLine>
        <InfoLine label="Source Type">{site.source.type}</InfoLine>
        <InfoLine label="Publish Options">
          {site.publish && site.publish.length > 0 ? site.publish.map(x => x.key).join(", ") : "EMPTY"}
        </InfoLine>
        {configurations.global.siteManagementEnabled ? (
          <InfoLine label="Config Location">
            <TextField id="config-location" value={site.configPath} />
            <FlatButton
              style={{ minWidth: "40px" }}
              icon={<IconFileFolder />}
              onClick={() => {
                service.api.openFileExplorer(site.configPath.replace(/(\\|\/)[^\/\\]+$/, ""));
              }}
            />
          </InfoLine>
        ) : null}
        {dependencies.length > 0 && (
          <InfoLine label="Dependencies">
            <span style={{ color: this.props.muiTheme?.textField?.errorColor }}>
              The following dependencies required by this website are not satisfied: {dependencies.join(", ")}.<br />
              Please install all dependencies.
            </span>
          </InfoLine>
        )}
        <InfoBlock label="Workspaces">{this.renderWorkspaces()}</InfoBlock>
        {this.state.publishSiteDialog != null ? (
          <PublishSiteDialog
            site={this.props.site}
            workspace={this.state.publishSiteDialog.workspace}
            workspaceHeader={this.state.publishSiteDialog.workspaceHeader}
            onCancelClick={this.handlePublishSiteCancelClick}
            onBuildAndPublishClick={this.handleBuildAndPublishClick}
            open={this.state.publishSiteDialog != null && this.state.publishSiteDialog.open}
          />
        ) : null}
      </Wrapper>
    );
  }

  async mountWorkspace(siteKey: string, workspace: WorkspaceHeader) {
    await service.api.mountWorkspace(siteKey, workspace.key);
    //this.load(siteKey, workspace.key);
  }

  getWorkspaceDetails = (workspace: WorkspaceHeader) => {
    return service.getWorkspaceDetails(this.props.site.key, workspace.key);
  };

  handlePublishSiteCancelClick = () => {
    this.setState(s => {
      const x = { ...s.publishSiteDialog!, open: false };
      return { ...s, publishSiteDialog: x };
    });
  };

  handleAddWorkspace = async (workspaceKey: string) => {
    const operationKey = `add-workspace-${this.props.site.key}-${workspaceKey}`;
    blockingOperationService.startOperation({ key: operationKey, title: `Adding workspace ${workspaceKey}` });
    debugger;
    try {
      await service.api.mountWorkspace(this.props.site.key, workspaceKey);
      const workspaces = await service.api.listWorkspaces(this.props.site.key);
      this.setState({ selectedSiteWorkspaces: workspaces });
    } catch {
      alert("Failed to add workspace.");
    } finally {
      blockingOperationService.endOperation(operationKey);
    }
  };

  renderWorkspaces() {
    const { site } = this.props;
    const workspaces = this.state.selectedSiteWorkspaces;

    if (workspaces == null) return <Wrapper></Wrapper>;

    return (
      <Workspaces
        getWorkspaceDetails={this.getWorkspaceDetails}
        workspaces={workspaces}
        activeSiteKey={this.props.activeSiteKey}
        activeWorkspaceKey={this.props.activeWorkspaceKey}
        onLocationClick={location => {
          service.api.openFileExplorer(location);
        }}
        onPublishClick={(workspaceHeader, workspace) => {
          this.setState({ publishSiteDialog: { workspace, workspaceHeader, open: true } });
        }}
        onStartServerClick={(workspace, serveKey) => {
          service.api.serveWorkspace(site.key, workspace.key, serveKey);
        }}
        onUnmountedWorkspaceClick={workspace => {
          this.mountWorkspace(site.key, workspace);
        }}
        onSelectWorkspaceClick={this.props.onSelectWorkspace}
        onAddWorkspace={this.handleAddWorkspace}
        site={site}
      />
    );
  }
}
export default muiThemeable()<typeof SiteDetails, Props>(SiteDetails);
