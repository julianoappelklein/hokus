import { withRouter, RouteComponentProps } from "react-router-dom";
import React, { CSSProperties } from "react";
import service from "./../../services/service";
import { Wrapper, MessageBlock } from "./components/shared";
import CreateSiteDialog from "./components/CreateSiteDialog";
import Spinner from "./../../components/Spinner";
import muiThemeable from "material-ui/styles/muiThemeable";
import { MuiTheme } from "material-ui/styles";

import { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader } from "./../../types";
import SiteDetails from "./components/SiteDetails/SiteDetails";
import { blockingOperationService } from "../../services/ui-service";
import SiteList from "./components/SiteList";

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
  }
};

interface HomeProps extends RouteComponentProps {
  siteKey: string;
  workspaceKey: string;
  muiTheme?: MuiTheme;
}

interface HomeState {
  configurations?: Configurations | EmptyConfigurations;
  selectedSite?: SiteConfig;
  selectedWorkspace?: WorkspaceHeader;
  createSiteDialog: boolean;
}

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      createSiteDialog: false
    };
  }

  componentDidMount() {
    service.registerListener(this);
    const { siteKey, workspaceKey } = this.props;
    this.load(siteKey, workspaceKey);
  }

  private load(siteKey?: string, workspaceKey?: string) {
    if (siteKey && workspaceKey) {
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then(bundle => {
        const stateUpdate = {} as HomeState;
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;
        stateUpdate.selectedWorkspace = bundle.workspace;
        this.setState(stateUpdate);
      });
    } else {
      service.getConfigurations().then(c => {
        const stateUpdate = {} as HomeState;
        stateUpdate.configurations = c;
        this.setState(stateUpdate);
      });
    }
  }

  private selectSite = (site: SiteConfig) => {
    this.setState({ selectedSite: site });
  };

  componentWillUnmount() {
    service.unregisterListener(this);
  }

  private handleSelectWorkspaceClick = (e: Event, siteKey: string, workspace: WorkspaceHeader) => {
    e.stopPropagation();
    this.selectWorkspace(siteKey, workspace);
  };

  async mountWorkspace(siteKey: string, workspace: WorkspaceHeader) {
    await service.api.mountWorkspace(siteKey, workspace.key);
    this.load(siteKey, workspace.key);
  }

  async selectWorkspace(siteKey: string, workspace: WorkspaceHeader) {
    let activeWorkspaceKey = this.props.workspaceKey;
    let activeSiteKey = this.props.siteKey;

    const select =
      activeWorkspaceKey == null ||
      activeSiteKey == null ||
      activeWorkspaceKey != workspace.key ||
      activeSiteKey != siteKey;

    if (select) {
      await service.api.touchSite(siteKey, workspace.key);
      this.props.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}`);
    } else {
      this.props.history.push(`/`);
    }
  }

  handleCreateSiteClick = () => {
    this.setState({ createSiteDialog: true });
  };

  handleCreateSiteSubmit = async (data: any) => {
    const operationKey = `create-site-${data.key}`;
    blockingOperationService.startOperation({ key: operationKey, title: "Creating site..." });
    try {
      await service.api.createSite(data);
      const configurations = await service.getConfigurations(true);
      this.setState({ configurations, createSiteDialog: false });
      blockingOperationService.endOperation(operationKey);
      return true;
    } catch {
      alert("Failed to create site");
      blockingOperationService.endOperation(operationKey);
      return false;
    }
  };

  render() {
    let { siteKey } = this.props;
    let { selectedSite, configurations, createSiteDialog } = this.state;

    let _configurations = (configurations as any) as Configurations;

    if (configurations == null) {
      return <Spinner />;
    }

    const handleCreateSiteClick =
      configurations.type == "EmptyConfigurations" || _configurations.global.siteManagementEnabled
        ? this.handleCreateSiteClick
        : undefined;

    return (
      <div style={styles.container}>
        <div style={styles.sitesCol}>
          <SiteList
            sites={_configurations.sites}
            activeSiteKey={siteKey}
            selectedSiteKey={selectedSite?.key}
            onCreateSiteClick={handleCreateSiteClick}
            onSelectSiteClick={this.selectSite}
          />
        </div>
        <div style={styles.selectedSiteCol}>
          {selectedSite == null ? (
            <Wrapper title="Site Management">
              <MessageBlock>Please, select a site.</MessageBlock>
            </Wrapper>
          ) : (
            <SiteDetails
              key={selectedSite.key}
              activeSiteKey={this.props.siteKey}
              activeWorkspaceKey={this.props.workspaceKey}
              configurations={_configurations}
              site={selectedSite}
              onSelectWorkspace={this.handleSelectWorkspaceClick}
            />
          )}
        </div>
        <CreateSiteDialog
          open={createSiteDialog}
          onCancelClick={() => this.setState({ createSiteDialog: false })}
          onSubmitClick={this.handleCreateSiteSubmit}
        />
      </div>
    );
  }
}

export default withRouter(muiThemeable()<typeof Home, HomeProps>(Home));
