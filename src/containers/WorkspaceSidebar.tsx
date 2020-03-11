import React from "react";
import { Route } from "react-router-dom";
import { List, ListItem } from "material-ui/List";
import { FlatButton } from "material-ui";
import IconActionSetting from "material-ui/svg-icons/action/settings";
import IconPlay from "material-ui/svg-icons/av/play-arrow";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import Border from "./../components/Border";
import { TriggerWithOptions } from "./../components/TriggerWithOptions";
import service from "./../services/service";
import { SiteConfig, WorkspaceConfig } from "./../types";
import * as Sidebar from "./Sidebar";

const translucentColor = "RGBA(255,255,255,.2)";

const MenuBorder = ({ children }: any) => {
  return (
    <Border style={{ margin: "0 16px", borderRadius: 3, padding: "1px", borderColor: translucentColor }}>
      {children}
    </Border>
  );
};

interface WorkspaceWidgetProps {
  onClick: () => void;
  siteConfig?: SiteConfig;
  workspaceConfig?: WorkspaceConfig;
};

const WorkspaceWidget: React.FC<WorkspaceWidgetProps> = ({ onClick, siteConfig, workspaceConfig }) => {

  const serverOptions =
    workspaceConfig != null && workspaceConfig.serve != null
      ? workspaceConfig.serve.map(x => x.key || "default")
      : [];

  return (
    <MenuBorder>
      <List style={{ padding: 0 }}>
        {siteConfig != null && workspaceConfig != null ? (
          <ListItem
            primaryText={siteConfig.name}
            secondaryText={workspaceConfig.key}
            onClick={onClick}
            rightIcon={<IconActionSetting color={translucentColor} />}
          />
        ) : (
            <ListItem
              primaryText={"Please"}
              secondaryText={"select a workspace"}
              onClick={onClick}
              rightIcon={<IconActionSetting color={translucentColor} />}
            />
          )}
      </List>
      {siteConfig != null && workspaceConfig != null ? (
        <div style={{ display: "flex" }}>
          <TriggerWithOptions
            triggerType={FlatButton}
            triggerProps={{
              style: { flex: 1, minWidth: 40 },
              icon: <IconPlay color="white" style={{ opacity: 0.2 }} />,
              disabled: workspaceConfig == null || workspaceConfig.build == null || workspaceConfig.build.length == 0
            }}
            menuProps={{ style: { background: "rgb(22, 6, 47)" } }}
            popoverProps={{ style: { background: "rgb(22, 6, 47)" } }}
            options={serverOptions}
            onOptionClick={serve => {
              service.serveWorkspace(siteConfig.key, workspaceConfig.key, serverOptions[serve]);
            }}
          />
          <FlatButton
            onClick={function () {
              service.openWorkspaceDir(siteConfig.key, workspaceConfig.key);
            }}
            style={{ flex: 1, minWidth: 40 }}
            icon={<IconFileFolder color="white" style={{ opacity: 0.2 }} />}
          />
          {/* <FlatButton
           style={{flex:1, minWidth:40}}
           icon={<IconMore color="white"  style={{opacity:.2}} />} /> */}
        </div>
      ) : null}
    </MenuBorder>
  );
}

type WorkspaceSidebarProps = {
  siteKey: string | null | undefined;
  workspaceKey: string | null | undefined;
  history: any;
  menuIsLocked: boolean;
  onLockMenuClicked: () => void;
  onToggleItemVisibility: () => void;
  hideItems: boolean;
};

type WorkspaceSidebarState = {
  site?: SiteConfig;
  workspace?: WorkspaceConfig;
  error?: any;
};

class WorkspaceSidebar extends React.Component<WorkspaceSidebarProps, WorkspaceSidebarState> {
  constructor(props: WorkspaceSidebarProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    service.registerListener(this);
    this.refresh();
  }

  refresh = () => {
    const { siteKey, workspaceKey } = this.props;
    if (siteKey && workspaceKey) {
      const stateUpdate = {} as WorkspaceSidebarState;
      service
        .getSiteAndWorkspaceData(siteKey, workspaceKey)
        .then(bundle => {
          stateUpdate.site = bundle.site;
          stateUpdate.workspace = bundle.workspaceDetails;
          this.setState(stateUpdate);
        })
        .catch(e => {
          this.setState({ error: e });
        });
    }
  };

  componentWillUnmount() {
    service.unregisterListener(this);
  }

  render() {
    return (
      <Route
        render={({ history }) => {
          return this.renderWithRoute(history);
        }}
      />
    );
  }

  renderWithRoute(history: any) {
    const encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : "";
    const encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : "";
    const basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    const menus: Array<Sidebar.SidebarMenu> = [];

    const handleClickWorkspaceWidget = () => {
      if (this.state.error != null) {
        history.push("/");
        this.refresh();
      } else if (this.state.site != null) {
        history.push(basePath);
        this.refresh();
      }
    };

    //append workspace widget
    menus.push({
      title: "Foo Current Workspace",
      widget: (
        <WorkspaceWidget
          siteConfig={this.state.site}
          workspaceConfig={this.state.workspace}
          onClick={handleClickWorkspaceWidget}
        />
      )
    });

    if (this.state.workspace) {
      //collections menu
      menus.push({
        title: "Collections",
        items: this.state.workspace.collections.map(collection => {
          return {
            label: collection.title,
            onClick: () => {
              history.push(`${basePath}/collections/${encodeURIComponent(collection.key)}`);
              this.refresh();
            },
            active: false
          };
        })
      });

      //singles menu
      menus.push({
        title: "Singles",
        items: this.state.workspace.singles.map(collection => {
          return {
            label: collection.title,
            onClick: () => {
              history.push(`${basePath}/singles/${encodeURIComponent(collection.key)}`);
              this.refresh();
            },
            active: false
          };
        })
      });
    }

    return (
      <React.Fragment>
        <Sidebar.Sidebar
          hideItems={this.props.hideItems}
          menuIsLocked={this.props.menuIsLocked}
          menus={menus}
          onLockMenuClicked={this.props.onLockMenuClicked}
          onToggleItemVisibility={this.props.onToggleItemVisibility}
        />
        {this.state.error && (
          <p
            style={{
              color: "#EC407A",
              padding: "10px",
              margin: "16px",
              fontSize: "14px",
              border: "solid 1px #EC407A",
              borderRadius: 3
            }}
          >
            {this.state.error}
          </p>
        )}
      </React.Fragment>
    );
  }
}

export default WorkspaceSidebar;
