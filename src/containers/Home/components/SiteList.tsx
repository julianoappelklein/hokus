import * as React from "react";
import { List, Subheader, ListItem } from "material-ui";
import { SiteConfig } from "../../../../global-types";
import IconNavigationCheck from "material-ui/svg-icons/navigation/check";
import IconAdd from "material-ui/svg-icons/content/add";
import muiThemeable from "material-ui/styles/muiThemeable";
import { MuiTheme } from "material-ui/styles";

const styles: { [k: string]: React.CSSProperties } = {
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

interface Props {
  activeSiteKey?: string;
  selectedSiteKey?: string;
  sites: SiteConfig[];
  onSelectSiteClick?: (site: SiteConfig) => void;
  onCreateSiteClick?: () => void;
  muiTheme?: MuiTheme;
}

class SiteList extends React.Component<Props> {
  public render() {
    const { sites, activeSiteKey, selectedSiteKey, onCreateSiteClick } = this.props;
    return (
      <List>
        <Subheader>All Sites</Subheader>
        {(sites || []).map((item, index) => {
          let selected = item.key === selectedSiteKey;
          let active = item.key === activeSiteKey;
          return (
            <ListItem
              key={index}
              style={selected ? styles.siteActiveStyle : styles.siteInactiveStyle}
              rightIcon={
                <IconNavigationCheck color={active ? this.props.muiTheme?.palette?.primary1Color : undefined} />
              }
              onClick={() => {
                this.props.onSelectSiteClick && this.props.onSelectSiteClick(item);
              }}
              primaryText={item.name}
            />
          );
        })}
        {onCreateSiteClick && (
          <ListItem
            key="add-site"
            style={styles.siteInactiveStyle}
            rightIcon={<IconAdd />}
            onClick={onCreateSiteClick}
            primaryText="New"
          />
        )}
      </List>
    );
  }
}

export default muiThemeable()<typeof SiteList, Props>(SiteList);
