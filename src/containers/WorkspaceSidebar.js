//@flow

import React from 'react';
import { Route } from 'react-router-dom'
import {List, ListItem } from 'material-ui/List';
import { FlatButton, Subheader } from 'material-ui';
import IconActionList from 'material-ui/svg-icons/action/list';
import IconActionSetting from 'material-ui/svg-icons/action/settings';
import IconPlay from 'material-ui/svg-icons/av/play-arrow';
import IconLockMenu from 'material-ui/svg-icons/action/lock-outline';
import IconMenu from 'material-ui/svg-icons/navigation/menu';
import IconMore from 'material-ui/svg-icons/navigation/more-vert';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import Border from './../components/Border';
import service from './../services/service'
import * as Sidebar from './Sidebar';

const Fragment = React.Fragment;
const translucentColor = 'RGBA(255,255,255,.2)';
const translucentColorSubtle = 'RGBA(255,255,255,.05)';

let MenuBorder = ({ children }) => {
  return <Border style={{margin: '0 16px', borderRadius:3, padding: '1px', borderColor:translucentColor}}>
    {children}
  </Border>;
}

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
      {/* <FlatButton
        style={{flex:1, minWidth:40}}
        icon={<IconMore color="white"  style={{opacity:.2}} />} /> */}
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

type WorkspaceSidebarProps = {
  siteKey : ?string,
  workspaceKey : ?string,
  history: any,
  menuIsLocked: bool,
  onLockMenuClicked: ()=> void,
  onToggleItemVisibility: ()=> void,
  hideItems : bool
}

type WorkspaceSidebarState = {
  site : any,
  workspace : any
}


class WorkspaceSidebar extends React.Component<WorkspaceSidebarProps,WorkspaceSidebarState>{

  constructor(props : WorkspaceSidebarProps){
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
    return (<Route render={({history})=>{ return this.renderWithRoute(history) }} />);
  }

  renderWithRoute(history: any){

    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    let menus: Array<Sidebar.SidebarMenu> = [];

    //append workspace widget
    menus.push({
      title: 'Current Workspace',
      widget: (
        <WorkspaceWidget
          siteKey={this.state.site?this.state.site.key:null}
          siteName={this.state.site?this.state.site.name:null}
          workspaceKey={this.props.workspaceKey}
          onClick={()=>{
            if(this.state.site!=null)
              history.push(basePath)            
          }} />
      )
    });

    if(this.state.workspace){
      //collections menu
      menus.push({
        title: 'Collections',
        items: this.state.workspace.collections.map((collection, index) => {
          return {
            label: collection.title,
            onClick: function(){ history.push(`${basePath}/collections/${encodeURIComponent(collection.key)}`) },
            active: false
          }
        })
      });

      //singles menu
      menus.push({
        title: 'Singles',
        items: this.state.workspace.singles.map((collection, index) => {
          return {
            label: collection.title,
            onClick: function(){ history.push(`${basePath}/singles/${encodeURIComponent(collection.key)}`) },
            active: false
          }
        })
      });
    }

    

    return (
      <Sidebar.Sidebar
        hideItems={this.props.hideItems}
        menuIsLocked={this.props.menuIsLocked}
        menus={menus}
        onLockMenuClicked={this.props.onLockMenuClicked}
        onToggleItemVisibility={this.props.onToggleItemVisibility}
      />
    )
  }
}

export default WorkspaceSidebar;