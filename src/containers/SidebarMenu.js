//@flow

import React from 'react';
import { Route } from 'react-router-dom'
import {List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import IconActionList from 'material-ui/svg-icons/action/list';
import IconActionSetting from 'material-ui/svg-icons/action/settings';
import IconPlay from 'material-ui/svg-icons/av/play-arrow';
import IconLockMenu from 'material-ui/svg-icons/action/lock-outline';
import IconMenu from 'material-ui/svg-icons/navigation/menu';
import IconMore from 'material-ui/svg-icons/navigation/more-vert';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import Border from './../components/Border';
import service from './../services/service'

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { FlatButton, IconButton } from 'material-ui';

const Fragment = React.Fragment;
const translucentColor = 'RGBA(255,255,255,.2)';
const translucentColorSubtle = 'RGBA(255,255,255,.05)';

let MenuBorder = ({ children }) => {
  return <Border style={{margin: '0 16px', borderRadius:3, padding: '1px', borderColor:translucentColor}}>
    {children}
  </Border>;
}

let WhiteSubHeader = ({children}) => {
  return <Subheader style={{color: 'white', fontWeight:300}}>{children}</Subheader>
};

type WorkspaceWidgetProps = {
  onClick : ()=> void,
  siteKey : ?string,
  siteName : ?string,
  workspaceKey : ?string
}

class WorkspaceWidget extends React.Component<WorkspaceWidgetProps,any> {
  
  render(){
    let {
      onClick,
      siteName,
      siteKey,
      workspaceKey,
    } = this.props;    

    return <MenuBorder>
    <List style={{padding: 0}}>
      <ListItem
        primaryText={siteName || 'Please'}
        secondaryText={workspaceKey || 'select a workspace' }
        onClick={onClick}
        rightIcon={<IconActionSetting color={translucentColor} />}
        />
    </List >
    { siteKey && workspaceKey ? 
    <div style={{display:'flex'}}>
      <FlatButton
        onClick={ function(){ service.serveWorkspace(siteKey, workspaceKey) } }
        style={{flex:1, minWidth:40}}
        icon={<IconPlay color="white" style={{opacity:.2}} />}
        />
      <FlatButton
        onClick={function(){ service.openWorkspaceDir(siteKey, workspaceKey) }}
        style={{flex:1, minWidth:40}}
        icon={<IconFileFolder color="white" style={{opacity:.2}} />} />
      <FlatButton
        style={{flex:1, minWidth:40}}
        icon={<IconMore color="white"  style={{opacity:.2}} />} />
    </div> : undefined }
  </MenuBorder>
  }
}

type ListItemCustomProps = {
  label : string,
  pathname: string,
  history : any,
  location: {pathname:string}
};

class ListItemCustom extends React.Component<ListItemCustomProps,any>{
  render () {
    let {label, pathname, history, location} = this.props;
    let style = (pathname===location.pathname) ? {background: translucentColorSubtle}:{};
    return <ListItem
    innerDivStyle={style}
      onClick={()=> history.push(pathname)} primaryText={label} leftIcon={<IconActionList color={translucentColor} />}
      />;
  }
}

type SidebarMenuProps = {
  siteKey : ?string,
  workspaceKey : ?string,
  history: any,
  menuIsLocked: bool,
  onLockMenuClicked: ()=> void,
  onToggleItemVisibility: ()=> void,
  hideItems : bool
}

type SidebarMenuState = {
  site : any,
  workspace : any
}


class SidebarMenu extends React.Component<SidebarMenuProps,SidebarMenuState>{

  constructor(props : SidebarMenuProps){
    super(props);
    this.state = {
      site: null,
      workspace: null
    };
  }

  componentWillMount(){
    service.registerListener(this);
    
    let {siteKey, workspaceKey } = this.props;

    if(siteKey && workspaceKey){
      let stateUpdate = {};
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        stateUpdate.site = bundle.site;
        return service.getWorkspaceDetails(siteKey, workspaceKey);
      }).then((workspace : any )=>{
        stateUpdate.workspace = workspace;
        this.setState(stateUpdate);
      });
    }

  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  render(){

    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    return (<Route
      render={({ history, match, location })=>{
        let workspaceOptions = undefined;
        if(this.state.workspace!=null){
          
          let collections = this.state.workspace.collections.map((collection, index) => {
            let pathname = `${basePath}/collections/${encodeURIComponent(collection.key)}`;
            return (<ListItemCustom
              key={index}
              history={history}
              label={collection.title}
              location={location}
              pathname={pathname}
              />);
          });
      
          let singles = this.state.workspace.singles.map((single, index) => (
            <ListItemCustom key={index} label={single.title} history={history} location={location} pathname={`/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/singles/${encodeURIComponent(single.key)}`} />
          ));
    
          workspaceOptions = <Fragment key="workspace-opts">
            
            { this.state.workspace.collections.length ? <Fragment key="collections">
              <WhiteSubHeader>Collections</WhiteSubHeader>
              <MenuBorder>
                <List style={{padding: 0}}>
                  { collections }
                </List >
              </MenuBorder></Fragment> : undefined }
            { this.state.workspace.singles.length ? <Fragment  key="singles">
              <WhiteSubHeader>Configurations</WhiteSubHeader>          
              <MenuBorder>
                <List style={{padding: 0}}>
                {singles}
                </List >
              </MenuBorder></Fragment>
            : undefined }
          </Fragment>;
        }
        return (
          <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
            <React.Fragment>
              <div style={{position:'relative'}}>
                <IconMenu style={{ position: 'absolute', right: '21px', top:'15px' }} />
                <FlatButton
                  style={Object.assign({},
                    { height:'calc(100vh - 42px)',width:'100%', position:'absolute', transition: 'all .2s'},
                    this.props.hideItems? { opacity:1 } : { opacity:0, pointerEvents:'none' }
                  )}
                  label=" "
                  onClick={()=>{this.props.onToggleItemVisibility()}}/>
                <div style={ Object.assign({},
                  { width:'280px', transition: 'all .2s' },
                  this.props.hideItems? { opacity:0, pointerEvents:'none' } : { opacity:1 }
                )}>
    
                  <IconButton
                    onClick={()=>this.props.onLockMenuClicked()}
                    style={{ position: 'absolute', right: '48px', top:'3px' }}
                    iconStyle={{opacity: (this.props.menuIsLocked?'1':'.2')  }}>
                    <IconLockMenu />}
                  </IconButton>
      
                  <WhiteSubHeader>Current Workspace</WhiteSubHeader>
                  
                  <WorkspaceWidget
                    siteKey={this.state.site?this.state.site.key:null}
                    siteName={this.state.site?this.state.site.name:null}
                    workspaceKey={this.props.workspaceKey}
                    onClick={function(){ history.push(basePath) }} />
                  { workspaceOptions }
                  <br />
                </div>
              </div>
            </React.Fragment>
          </MuiThemeProvider>
        )
      }}
    />);
  }
}

export default SidebarMenu;