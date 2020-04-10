import { Route } from "react-router-dom";
import React, { CSSProperties } from "react";
import service from "./../../services/service";
import { snackMessageService } from "./../../services/ui-service";
import FlatButton from "material-ui/FlatButton";
import { List, ListItem } from "material-ui/List";
import Subheader from "material-ui/Subheader";
import IconNavigationCheck from "material-ui/svg-icons/navigation/check";
import IconAdd from "material-ui/svg-icons/content/add";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import TextField from "material-ui/TextField";
import { Wrapper, InfoLine, InfoBlock, MessageBlock } from "./components/shared";
import { Workspaces } from "./components/Workspaces";
import CreateSiteDialog from "./components/CreateSiteDialog";
import PublishSiteDialog from "./components/PublishSiteDialog";
import BlockDialog from "./components/BlockDialog";
import Spinner from "./../../components/Spinner";
import muiThemeable from "material-ui/styles/muiThemeable";
import { MuiTheme } from "material-ui/styles";

import { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from "./../../types";
import MuiThemed from "../../components/MuiThemed";

const styles: { [k: string]: CSSProperties } = {
  container: {
    display: "flex",
    height: "100%"
  },
  sitesCol: {
    flex: "0 0 280px",
    overflowY: "auto",
    overflowX: "hidden",
    userSelect: "none",
    borderRight: "solid 1px #e0e0e0",
    background: "#fafafa"
  },
  selectedSiteCol: {
    flex: "auto",
    overflow: "auto"
  },
  siteActiveStyle: {
    fontWeight: "bold",
    backgroundColor: "white",
    borderBottom: "solid 1px #e0e0e0",
    borderTop: "solid 1px #e0e0e0",
    position: "relative"
  },
  siteInactiveStyle: {
    borderBottom: "solid 1px transparent",
    borderTop: "solid 1px transparent"
  }
};

interface HomeProps {
  siteKey: string;
  workspaceKey: string;
  muiTheme?: MuiTheme;
}

interface HomeState {
  configurations?: Configurations | EmptyConfigurations;
  selectedSite?: SiteConfig;
  selectedSiteWorkspaces?: Array<WorkspaceHeader>;
  selectedWorkspace?: WorkspaceHeader;
  selectedWorkspaceDetails?: WorkspaceConfig;
  createSiteDialog: boolean;
  publishSiteDialog?: { workspace: WorkspaceConfig; workspaceHeader: WorkspaceHeader; open: boolean };
  blockingOperation: string | null | undefined; //this should be moved to a UI service
}

class Home extends React.Component<HomeProps, HomeState> {
  history: any;

  constructor(props: HomeProps) {
    super(props);
    this.state = {
      blockingOperation: null,
      createSiteDialog: false,
      publishSiteDialog: undefined
    };
  }

  componentDidMount() {
    console.log("HOME MOUNTED");
    service.registerListener(this);

    var { siteKey, workspaceKey } = this.props;
    if (siteKey && workspaceKey) {
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then(bundle => {
        var stateUpdate = {} as HomeState;
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;
        stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
        stateUpdate.selectedWorkspace = bundle.workspace;
        stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;
        this.setState(stateUpdate);
        return service.getWorkspaceDetails(siteKey, workspaceKey);
      });
    } else {
      service.getConfigurations().then(c => {
        var stateUpdate = {} as HomeState;
        stateUpdate.configurations = c;
        this.setState(stateUpdate);
      });
    }
  }

  selectSite(site: SiteConfig) {
    this.setState({ selectedSite: site, selectedSiteWorkspaces: [] });
    //load all site configuration to enforce validation
    service.api.listWorkspaces(site.key).then(workspaces => {
      if (workspaces.length === 1) {
        this.selectWorkspace(site.key, workspaces[0]);
      }

      this.setState({ selectedSiteWorkspaces: workspaces });
    });
  }

  getWorkspaceDetails = (workspace: WorkspaceHeader) => {
    if (this.state.selectedSite == null) throw new Error("Invalid operation.");
    return service.getWorkspaceDetails(this.state.selectedSite.key, workspace.key);
  };

  componentWillUnmount() {
    service.unregisterListener(this);
  }

  renderSelectedSiteContent(configurations: Configurations, site: SiteConfig) {
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
        <InfoBlock label="Workspaces">{this.renderWorkspaces(site, this.state.selectedSiteWorkspaces)}</InfoBlock>
      </Wrapper>
    );
  }

  handleSelectWorkspaceClick = (e: Event, siteKey: string, workspace: WorkspaceHeader) => {
    e.stopPropagation();
    this.selectWorkspace(siteKey, workspace);
  };

  async selectWorkspace(siteKey: string, workspace: WorkspaceHeader) {
    let activeWorkspaceKey = this.props.workspaceKey;
    let activeSiteKey = this.props.siteKey;

    let select =
      activeWorkspaceKey == null ||
      activeSiteKey == null ||
      activeWorkspaceKey != workspace.key ||
      activeSiteKey != siteKey;

    if (select) {
      await service.api.touchSite(siteKey, workspace.key);
      this.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}`);
    } else {
      this.history.push(`/`);
    }
    console.log(window.location.toString());
  }

  renderWorkspaces(site: SiteConfig, workspaces: Array<WorkspaceHeader> | null | undefined) {
    return (
      <Route
        render={({ history }) => {
          this.history = history; //ugly

          if (workspaces == null) return <Wrapper></Wrapper>;

          return (
            <Workspaces
              getWorkspaceDetails={this.getWorkspaceDetails}
              workspaces={workspaces}
              activeSiteKey={this.props.siteKey}
              activeWorkspaceKey={this.props.workspaceKey}
              onLocationClick={location => {
                service.api.openFileExplorer(location);
              }}
              onPublishClick={(workspaceHeader, workspace) => {
                this.setState({ publishSiteDialog: { workspace, workspaceHeader, open: true } });
              }}
              onStartServerClick={(workspace, serveKey) => {
                service.api.serveWorkspace(site.key, workspace.key, serveKey);
              }}
              onSelectWorkspaceClick={this.handleSelectWorkspaceClick}
              site={site}
            />
          );
        }}
      />
    );
  }

  handleAddSiteClick() {
    this.setState({ createSiteDialog: true });
  }

  handleCreateSiteSubmit = async (data: any) => {
    this.setState({ blockingOperation: "Creating site..." });
    try {
      await service.api.createSite(data);
      const configurations = await service.getConfigurations(true);
      this.setState({ configurations, blockingOperation: null, createSiteDialog: false });
      return true;
    } catch {
      alert("Failed to create site");
      this.setState({ blockingOperation: null });
      return false;
    }
  };

  handlePublishSiteCancelClick = () => {
    this.setState(s => {
      const x = { ...s.publishSiteDialog!, open: false };
      return { ...s, publishSiteDialog: x };
    });
  };

  handleBuildAndPublishClick = ({ siteKey, workspaceKey, build, publish }: any) => {
    this.setState({ blockingOperation: "Building site...", publishSiteDialog: undefined });
    service.api
      .buildWorkspace(siteKey, workspaceKey, build)
      .then(() => {
        this.setState({ blockingOperation: "Publishing site..." });
        return service.api.publishSite(siteKey, publish);
      })
      .then(() => {
        snackMessageService.addSnackMessage("Site successfully published.");
      })
      .catch(() => {
        snackMessageService.addSnackMessage("Publish failed.");
      })
      .then(() => {
        this.setState({ blockingOperation: null });
      });
  };

  render() {
    let { siteKey } = this.props;
    let { selectedSite, configurations, createSiteDialog, publishSiteDialog } = this.state;

    let _configurations = (configurations as any) as Configurations;

    if (configurations == null) {
      return <Spinner />;
    }

    return (
      <div style={styles.container}>
        <div style={styles.sitesCol}>
          <List>
            <Subheader>All Sites</Subheader>
            {(_configurations.sites || []).map((item, index) => {
              let selected = item === selectedSite;
              let active = selectedSite && siteKey === item.key;
              return (
                <ListItem
                  key={index}
                  style={selected ? styles.siteActiveStyle : styles.siteInactiveStyle}
                  rightIcon={
                    <IconNavigationCheck color={active ? this.props.muiTheme?.palette?.primary1Color : undefined} />
                  }
                  onClick={() => {
                    this.selectSite(item);
                  }}
                  primaryText={item.name}
                />
              );
            })}
            {configurations.type == "EmptyConfigurations" || _configurations.global.siteManagementEnabled ? (
              <ListItem
                key="add-site"
                style={styles.siteInactiveStyle}
                rightIcon={<IconAdd />}
                onClick={this.handleAddSiteClick.bind(this)}
                primaryText="New"
              />
            ) : null}
          </List>
        </div>
        <div style={styles.selectedSiteCol}>
          {selectedSite == null ? (
            <Wrapper title="Site Management">
              <MessageBlock>Please, select a site.</MessageBlock>
            </Wrapper>
          ) : (
            this.renderSelectedSiteContent(_configurations, selectedSite)
          )}
        </div>
        <CreateSiteDialog
          open={createSiteDialog}
          onCancelClick={() => this.setState({ createSiteDialog: false })}
          onSubmitClick={this.handleCreateSiteSubmit}
        />
        {selectedSite != null && this.state.publishSiteDialog != null ? (
          <PublishSiteDialog
            site={selectedSite}
            workspace={this.state.publishSiteDialog.workspace}
            workspaceHeader={this.state.publishSiteDialog.workspaceHeader}
            onCancelClick={this.handlePublishSiteCancelClick}
            onBuildAndPublishClick={this.handleBuildAndPublishClick}
            open={publishSiteDialog != null && publishSiteDialog.open}
          />
        ) : null}

        {/*this should be moved to a UI service*/}
        <BlockDialog open={this.state.blockingOperation != null}>
          {this.state.blockingOperation}
          <span> </span>
        </BlockDialog>
      </div>
    );
  }
}

export default muiThemeable()<typeof Home, HomeProps>(Home);
