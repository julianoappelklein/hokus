import React from "react";
import { List, ListItem } from "material-ui/List";
import Subheader from "material-ui/Subheader";
import IconActionList from "material-ui/svg-icons/action/list";
import IconLockMenu from "material-ui/svg-icons/action/lock-outline";
import IconMenu from "material-ui/svg-icons/navigation/menu";
import Border from "./../components/Border";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { FlatButton, IconButton } from "material-ui";
import { darkMuiTheme } from "../theme";

const Fragment = React.Fragment;
const translucentColor = "RGBA(255,255,255,.2)";
const translucentColorSubtle = "RGBA(255,255,255,.05)";

let MenuBorder = ({ children }: any) => {
  return (
    <Border style={{ margin: "0 16px", borderRadius: 3, padding: "1px", borderColor: translucentColor }}>
      {children}
    </Border>
  );
};

let WhiteSubHeader = ({ children }: any) => {
  return <Subheader style={{ color: "white", fontWeight: 300 }}>{children}</Subheader>;
};

export type SidebarMenu = {
  title: string;
  key?: string;
  widget?: any;
  items?: Array<{
    active: boolean;
    label: string;
    onClick: () => void;
  }>;
};

export type SidebarProps = {
  menus: Array<SidebarMenu>;
  menuIsLocked: boolean;
  onLockMenuClicked: () => void;
  onToggleItemVisibility: () => void;
  hideItems: boolean;
};

type SidebarState = {};

export class Sidebar extends React.Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      site: null,
      workspace: null
    };
  }

  render() {
    let { hideItems, menus, menuIsLocked, onToggleItemVisibility } = this.props;
    let menusNodes = menus.map(menu => {
      return (
        <Fragment key={menu.key || menu.title}>
          <WhiteSubHeader>{menu.title}</WhiteSubHeader>
          {menu.widget ? menu.widget : null}
          {menu.items ? (
            <MenuBorder>
              <List style={{ padding: 0 }}>
                {menu.items.map((item, index) => {
                  let style = item.active ? { background: translucentColorSubtle } : {};
                  return (
                    <ListItem
                      key={index}
                      innerDivStyle={style}
                      onClick={item.onClick}
                      primaryText={item.label}
                      leftIcon={<IconActionList color={translucentColor}/>}
                    />
                  );
                })}
              </List>
            </MenuBorder>
          ) : null}
        </Fragment>
      );
    });

    return (
      <MuiThemeProvider muiTheme={darkMuiTheme}>
        <React.Fragment>
          <div className={"slideFadeInRight animated"} style={{ position: "relative", opacity: 1 }}>
            <IconMenu style={{ position: "absolute", right: "21px", top: "15px" }}/>

            <FlatButton
              style={{
                ...{ height: "calc(100vh - 42px)", width: "100%", position: "absolute" },
                ...{ transition: menuIsLocked ? undefined : "opacity 1s linear" },
                ...(hideItems ? { opacity: 1 } : { opacity: 0, pointerEvents: "none" })
              }}
              label=" "
              onClick={() => {
                onToggleItemVisibility();
              }}
            />

            <div
              style={{
                ...{ width: "280px", transition: "all .2s" },
                ...(hideItems ? { opacity: 0, pointerEvents: "none" } : { opacity: 1 })
              }}
            >
              <IconButton
                onClick={() => this.props.onLockMenuClicked()}
                style={{ position: "absolute", right: "48px", top: "3px" }}
                iconStyle={{ opacity: menuIsLocked ? "1" : ".2" }}
              >
                <IconLockMenu/>
              </IconButton>

              {menusNodes}

              <br/>
            </div>
          </div>
        </React.Fragment>
      </MuiThemeProvider>
    );
  }
}
