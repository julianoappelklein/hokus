//@flow

import { Route } from 'react-router-dom'
import React from 'react';
import service from './../../services/service'
import { snackMessageService } from './../../services/ui-service'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import {Accordion,AccordionItem} from './../../components/Accordion';
import DangerButton from './../../components/DangerButton';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Wrapper, InfoLine, InfoBlock, MessageBlock } from './components/shared';
import Workspaces from './components/Workspaces';
import CreateSiteDialog from './components/CreateSiteDialog/';
import BlockDialog from './components/BlockDialog';

import type { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

//$FlowFixMe
const Fragment = React.Fragment;

const styles = {
    container:{
        display:'flex',
        height: '100%'
    },
    sitesCol: {
        flex: '0 0 280px',
        overflowY:'auto',
        overflowX:'hidden',
        userSelect:'none',
        borderRight: 'solid 1px #e0e0e0',
        background:'#fafafa'
    },
    selectedSiteCol: {
        flex: 'auto',
        overflow: 'auto'
    },
    siteActiveStyle: {
        fontWeight: 'bold',
        backgroundColor: 'white',
        borderBottom: 'solid 1px #e0e0e0',
        borderTop: 'solid 1px #e0e0e0',
        position: 'relative'
    },
    siteInactiveStyle: {
        borderBottom: 'solid 1px transparent',
        borderTop: 'solid 1px transparent'
    }
}

type HomeProps = {
    muiTheme : any,
    siteKey : string,
    workspaceKey : string
}

type HomeState = {
    configurations?: Configurations,
    selectedSite?: SiteConfig,
    selectedSiteWorkspaces?: Array<any>,
    selectedWorkspace?: WorkspaceHeader,
    createSiteDialog: bool,
    blockingOperation: ?string
}

class Home extends React.Component<HomeProps, HomeState>{
    constructor(props){
        super(props);
        this.state = {
            createSiteDialog: false,
            blockingOperation: null
        };
    }
    componentWillMount(){
        service.registerListener(this);
    }

    componentDidMount(){
        var stateUpdate  = {};
        
        var load;

        var { siteKey, workspaceKey } = this.props;
        if(siteKey && workspaceKey){
            load = service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
                stateUpdate.configurations = bundle.configurations;
                stateUpdate.selectedSite = bundle.site;
                stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
                stateUpdate.selectedWorkspace = bundle.workspace;
            });
        }
        else{
            load = service.getConfigurations().then((c)=>{
                stateUpdate.configurations = c;
            })
        }

        load.then(()=>{
            this.setState(stateUpdate);
        })
    }

    selectSite(site : SiteConfig ){
        this.setState({selectedSite: site});
        service.api.listWorkspaces(site.key).then((workspaces)=>{
            this.setState({selectedSiteWorkspaces: workspaces});
        });
    }

    selectWorkspace(workspace : WorkspaceHeader, history : any ){
        let { selectedWorkspace } = this.state; let path;
        let select = selectedWorkspace==null || selectedWorkspace.path!=workspace.path;
        if(select)
            //$FlowFixMe
            history.push(`/sites/${decodeURIComponent(this.state.selectedSite.key)}/workspaces/${decodeURIComponent(workspace.key)}`);
        else
            history.push(`/`);
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }
    
    
    renderSelectedSiteContent(configurations: Configurations, site: SiteConfig ){
        return (<Wrapper style={{maxWidth:'1000px'}} key={site.key} title="Site Management">
            <InfoLine label="Name">{site.name}</InfoLine>
            <InfoLine label="Key">{site.key}</InfoLine>
            <InfoLine label="Source Type">{site.source.type}</InfoLine>
            { configurations.global.siteManagementEnabled? (
                <InfoLine label="Config Location">
                    <TextField id="config-location" value={site.configPath} readOnly={true} /> 
                    <FlatButton
                        style={{minWidth:'40px'}}
                        icon={<IconFileFolder />}
                        onClick={()=>{ service.api.openFileExplorer(site.configPath.replace(/(\\|\/)[^\/\\]+$/,'')) }}
                    />
                </InfoLine>
            ): ( null ) }
            <InfoBlock label="Workspaces">
                { this.renderWorkspaces(site, site.key===this.props.siteKey, this.state.selectedSiteWorkspaces) }
            </InfoBlock>
        </Wrapper>);
    }

    renderWorkspaces(site: SiteConfig, selectedSiteActive : bool , workspaces : ?Array<WorkspaceHeader>){
        return (
            <Route render={({history})=>{

                if(workspaces==null)
                    return (<Wrapper></Wrapper>);

                return (
                    <Workspaces
                        workspaces={workspaces}
                        activeWorkspaceKey={selectedSiteActive && this.state.selectedWorkspace ? this.state.selectedWorkspace.key : null }
                        onLocationClick={(location)=>{
                            service.api.openFileExplorer(location)
                        }}
                        onPublishClick={(warn, workspace)=>{
                            if(warn){
                                snackMessageService.addSnackMessage('You are about to perform a irreversible operation.', { autoHideDuration: 2000});
                            }
                            else{
                                service.api.publishWorkspace(site.key, workspace.key);
                            }
                        }}
                        onStartServerClick={ (workspace)=> { service.api.serveWorkspace(site.key, workspace.key) } } 
                        onSelectWorkspaceClick={ (workspace)=> { this.selectWorkspace(workspace, history) } }
                    />
                )
            }} />
        );
    }

    handleAddSiteClick(){
        this.setState({createSiteDialog: true});
    }

    handleCreateSiteSubmit = (data)=>{
        this.setState({createSiteDialog:false, blockingOperation:'Creating site...'})
        service.api.createSite(data).then(()=>{
            return service.getConfigurations(true);
        }).then(configurations=>{
            this.setState({configurations});
        }).catch((e)=>{
            alert('Failed to create site');
        }).then(()=>{
            this.setState({ blockingOperation:null})
        });
    }

    render(){

        let { siteKey } = this.props;
        let { selectedSite, configurations, createSiteDialog } = this.state;

        if(configurations==null){
            return <Wrapper title="Site Management"><MessageBlock>Loading configurations...</MessageBlock></Wrapper>
        }
   
        return (
            <div style={ styles.container }>
                <div style={ styles.sitesCol }>
                    <List>
                        <Subheader>All Sites</Subheader>
                        { (configurations.sites||[]).map((item, index)=>{
                            let selected = item===selectedSite;
                            let active = selectedSite && siteKey===item.key;
                            return (<ListItem
                                key={index}
                                style={selected? styles.siteActiveStyle : styles.siteInactiveStyle }
                                rightIcon={<IconNavigationCheck color={active?this.props.muiTheme.palette.primary1Color:undefined}  />}
                                onClick={ ()=>{ this.selectSite(item); } } 
                                primaryText={ item.name }
                            />);
                        })}
                        { configurations.empty || configurations.global.siteManagementEnabled ? (
                            <ListItem
                                key="add-site"
                                style={ styles.siteInactiveStyle }
                                rightIcon={<IconAdd />}
                                onClick={ this.handleAddSiteClick.bind(this) } 
                                primaryText="New"
                            />
                        ) : ( null ) }
                    </List>
                </div>
                <div style={styles.selectedSiteCol}>
                    { selectedSite==null ? (
                        <Wrapper title="Site Management">
                            <MessageBlock>Please, select a site.</MessageBlock>
                        </Wrapper>
                    ) : (
                        this.renderSelectedSiteContent(configurations, selectedSite)
                    ) }
                </div>
                <CreateSiteDialog
                    open={createSiteDialog}
                    onCancelClick={()=>this.setState({createSiteDialog:false})}
                    onSubmitClick={this.handleCreateSiteSubmit}
                />
                <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}<span> </span></BlockDialog>
            </div>         
        );
    }
    
}

export default muiThemeable()(Home);