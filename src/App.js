//@flow

import React from 'react';
import { Switch, Route } from 'react-router-dom'

//CONTAINERS
import Home from './containers/Home'
import Collection from './containers/Collection';
import CollectionItem from './containers/CollectionItem';
import Single from './containers/Single';
import Header from './containers/Header';
import NotificationUI from './containers/NotificationUI';

//MATERIAL UI
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Redirect from 'react-router-dom/Redirect';

import './css/App.css';
import SidebarMenu from './containers/SidebarMenu';
import ExtraOptions from './containers/ExtraOptions';

//the default locked UI style
const style = {
  container:{
    position: 'relative',
    display:'flex',
    height: 'calc(100vh - 42px)',
    marginTop: '42px',
    overflowX: 'hidden'
  },
  menuContainer: {
    flex: '0 0 280px',
    overflowY:'auto',
    overflowX:'hidden',
    userSelect:'none',
    background:'linear-gradient(to bottom right, #2a0d56, #16062f)',
  },
  contentContainer:{
    flex: 'auto',
    overflow: 'auto',
    overflowX: 'hidden'
  }
};


type AppProps = {
}

type AppState = {
  maximized : bool,
  menuIsLocked: bool,
  forceShowMenu: bool,
  skipMenuTransition: bool
}

class App extends React.Component<AppProps,AppState>{
  
  constructor(props : any ){
    super(props);

    let win = window.require('electron').remote.getCurrentWindow();
    this.state = {
      maximized:win.isMaximized(),
      menuIsLocked: true,
      forceShowMenu: false,
      skipMenuTransition: false
    };

    win.on('maximize', () => { this.setState({maximized: true}); });
    win.on('unmaximize', ()=>{ this.setState({maximized: false}); });
    window.state = this.state;
  }

  minimizeWindow(){
    window.require('electron').remote.getCurrentWindow().minimize();
  }

  closeWindow(){
    window.require('electron').remote.getCurrentWindow().close();
  }

  toggleWindowMode(){
    let win = window.require('electron').remote.getCurrentWindow();
    if(!this.state.maximized){
      win.maximize();
    }
    else{
      win.unmaximize();
    }
  }

  toggleMenuIsLocked(){   
    let menuIsLocked = !this.state.menuIsLocked;
    let forceShowMenu;
    if(!menuIsLocked){
      forceShowMenu = false;
    }
    this.setState({menuIsLocked, forceShowMenu, skipMenuTransition:true});
    window.dispatchEvent(new Event('resize'));
  }

  toggleForceShowMenu(){
    var forceShowMenu = !this.state.forceShowMenu;
    this.setState({forceShowMenu});
  }

  renderSidebar = (history : any, url : string, site : ?string, workspace : ?string)=>{
    return <SidebarMenu
      key={ url }
      siteKey={ site ? decodeURIComponent(site) : null }
      workspaceKey={ workspace ? decodeURIComponent(workspace) : null }
      history={history}
      hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
      menuIsLocked={this.state.menuIsLocked}
      onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
      onLockMenuClicked={()=>{this.toggleMenuIsLocked()}} />
  }

  getMenuSwitch(){
    return (<Switch>
      <Route path='/sites/:site/workspaces/:workspace' render={ ({match, history})=> {
        return this.renderSidebar(history, match.url, match.params.site, match.params.workspace);
      }} />
      <Route path="*" render={ ({match, history})=> {
        return this.renderSidebar(history, match.url, null, null);
      }} />
    </Switch>);
  }

  getContentSwitch(){
    return (<Switch>
      <Route path='/' exact render={ () => {
        return <Home />
      }} />
      <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match})=> {
        return <Home
          key={ match.url }
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />
      <Route path='/sites/:site/workspaces/:workspace/collections/:collection' exact render={ ({match})=> {
        return <Collection
          key={ match.url }
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) }
          collectionKey={ decodeURIComponent(match.params.collection) } />
      }} />
      <Route path='/sites/:site/workspaces/:workspace/collections/:collection/:item' exact render={ ({match})=> {
        return <CollectionItem
          key={ match.url }
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) }
          collectionKey={ decodeURIComponent(match.params.collection) }
          collectionItemKey={ decodeURIComponent(match.params.item) } />
      }} />
      <Route path='/sites/:site/workspaces/:workspace/singles/:single' exact render={ ({match})=> {
        return <Single
          key={ match.url }
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) }
          singleKey={ decodeURIComponent(match.params.single) } />
      }} />
      <Route path="*" component={(data)=>{
        console.log('Redirecting...',data);
        return <Redirect to='/' />
      }} />
    </Switch>);
  }

  render() {
 
    let header = <Header
      minimizeHandler={this.minimizeWindow.bind(this)}
      toggleMaximizeHandler={this.toggleWindowMode.bind(this)}
      closeHandler={this.closeWindow.bind(this)}
      isMaximized={this.state.maximized}
    />;

    let containerStyle = style.container;
    let menuContainerStyle = style.menuContainer;
    let contentContainerStyle = style.contentContainer;
    let hideMenuItems = false;

     if(!this.state.menuIsLocked){
      contentContainerStyle = Object.assign({}, contentContainerStyle, {display: 'block', paddingLeft:'66px' });
      menuContainerStyle = Object.assign({}, menuContainerStyle, { position: 'absolute', zIndex: '2', height:'100%', width:'280px', transform: 'translateX(-214px)' } )
      hideMenuItems = true;
      if(this.state.forceShowMenu){
        menuContainerStyle.transform='translateX(0px)';
        contentContainerStyle.transform='translateX(214px)';
      }
      if(!this.state.skipMenuTransition){
        let transition = 'all ease-in-out .3s';
        contentContainerStyle.transition = transition;
        menuContainerStyle.transition = transition;
      }
      this.state.skipMenuTransition = false;
    }
   
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div className="App">
          {header}
          <div style={containerStyle}>

            <ExtraOptions />

            <div style={menuContainerStyle} className='hideScrollbar' >
              { this.getMenuSwitch() }
            </div>

            <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>
              { this.getContentSwitch() }
            </div>

          </div>
          <NotificationUI />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;