//@flow

import { Route } from 'react-router-dom'
import React from 'react';
import service from './../services/service'
import { snackMessageService } from './../services/ui-service'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import {Accordion,AccordionItem} from './../components/Accordion';
import DangerButton from './../components/DangerButton';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';

import type { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../types';

//$FlowFixMe
const Fragment = React.Fragment;

const Wrapper = ({ title, style, children } : { title? : string, style? : any, children? : any } = {}) => {
    return <Fragment>
        {title? <Subheader>{title}</Subheader>:undefined}
        <div style={Object.assign({padding:'16px 0', paddingTop: title? '0px': '16px'}, style)}>{children}</div>
    </Fragment>;
}

let InfoLine = ({label, children, childrenWrapperStyle} : {label: string, children : any, childrenWrapperStyle?: any}) =>{
    return <div style={{ padding: '16px' }}><div style={{fontSize:'12px', lineHeight:'16px'}}>{label}</div><div style={childrenWrapperStyle}>{children}</div></div>;
}

let InfoBlock = ({label, children}) =>{
    return <div style={{ padding: '16px 0' }}><div style={{fontSize:'12px', lineHeight:'16px',  padding:'0 16px 4px 16px'}}>{label}</div><div>{children}</div></div>;
}

let MessageBlock = ({children}) =>{
    return <div style={{ padding: '16px' }}>{children}</div>;
}

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
    configurations? : Configurations,
    selectedSite? : SiteConfig,
    selectedSiteWorkspaces? : Array<any>,
    selectedWorkspace? : WorkspaceHeader
}

class Home extends React.Component<HomeProps, HomeState>{
    constructor(props){
        super(props);
        this.state = {
            configurations: undefined,
            selectedSite: undefined
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
        let path;
        if(this.state.selectedWorkspace!=workspace){
            this.setState({selectedWorkspace:workspace});
            //$FlowFixMe
            path = `/sites/${decodeURIComponent(this.state.selectedSite.key)}/workspaces/${decodeURIComponent(workspace.key)}`;
        }
        else{
            this.setState({selectedWorkspace:undefined});
            path = `/`;
        }
        console.log(path);
        history.push(path);
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }

    renderWorkspaces(selectedSiteActive : bool , workspaces : ?Array<WorkspaceHeader>){
         
        return <Route render={({history})=>{
            if(workspaces===undefined) return (<Wrapper></Wrapper>);
            
            return (<Accordion style={{ margin:'0 8px' }}>
            { (workspaces||[]).map((workspace,i) => {
                let active = selectedSiteActive && this.state.selectedWorkspace && workspace.key===this.state.selectedWorkspace.key;
                return (
                <AccordionItem key={i}
                    label={ workspace.key }
                    headStyle={{paddingLeft:'8px', paddingRight:'8px', fontWeight:active?'bold':undefined }}
                    headerLeftItems = {[
                        <FlatButton
                            style={{minWidth: '40px'}}
                            icon={<IconNavigationCheck />}
                            primary={active}
                            onClick={ (e)=>{ e.stopPropagation(); this.selectWorkspace(workspace, history); } }
                            />
                    ]}
                    body={
                        <div>
                            <InfoLine label="Local Path">
                                <TextField id="local-path" value={workspace.path} readOnly={true} /> 
                                <FlatButton
                                    style={{minWidth:'40px'}}
                                    icon={<IconFileFolder />}
                                    onClick={()=>{ service.api.openFileExplorer(workspace.path) }}
                                />
                            </InfoLine>
                            <InfoLine childrenWrapperStyle={{marginTop:'8px'}} label="Actions">
                                <RaisedButton
                                    label="Select"
                                    primary={active}
                                    onClick={ ()=>{ this.selectWorkspace(workspace, history); } }
                                />
                                &nbsp;
                                <FlatButton
                                    label="Start Server"
                                    onClick={ ()=>{
                                        //$FlowFixMe
                                        service.api.serveWorkspace(this.state.selectedSite.key, workspace.key) } }
                                />
                                &nbsp;
                                <DangerButton
                                    onClick={(e, loaded)=>{
                                        //$FlowFixMe
                                        if(loaded){ service.api.publishWorkspace(this.state.selectedSite.key, workspace.key) }
                                        else { snackMessageService.addSnackMessage('You are about to perform a irreversible operation', { autoHideDuration: 2000}); }
                                    }}
                                    loadedProps={{ secondary:true }}
                                    button={<FlatButton label="Publish" />} />
                            </InfoLine>
                        </div>
                    }
                />
            )})}
            </Accordion>)}
        } />;
    }

    renderEmptyConfigurations(){
        return <Wrapper title="Site Management">
        <div class="row">
        <div class="col-xl-5 col-lg-8 col-md-12">
            <MessageBlock>Looks like your configuration is empty.</MessageBlock>
            <MessageBlock>We are looking for files matching the following glob patterns:<br />
                
                <ul>{
                    /*$FlowFixMe*/
                    this.state.configurations.fileSearchPatterns.map((pattern)=><li><b>{pattern}</b></li>)
                }</ul>
            </MessageBlock>
            <MessageBlock>
                You can copy and paste the minimal configuration from the box below into a new file.
                Just don't forget to replace the properties <b>key, name and path</b>.
                Note that you can have multiple configuration files, each containing one or more sites. Just use the patterns displayed above.
            </MessageBlock>
            <MessageBlock>
<Paper style={{padding:16}}>
<pre>{JSON.stringify({
"sites":
[
    {
        "name": "{AWESOME_SITE_NAME}",
        "key": "{AWESOME_SITE_UNIQUE_KEY}",
        "source": {        
            "type": "folder",
            "path": "{FULL_PATH_TO_SITE_ROOT}"
        }
    }
]
}, null, '  ')}</pre>
</Paper>
        </MessageBlock>
        <MessageBlock>
            After creating your files, you need to restart the application 
            (look for a hidden icon at the bottom left corner of this window).
        </MessageBlock>
        </div>
        </div>
        </Wrapper>;
    }

    renderSelectedSiteContent(site : ?SiteConfig ){
        if(site==null){
            return <Wrapper  title="Site Management"><MessageBlock>Please, select a site.</MessageBlock></Wrapper>;
        }
        else{
            return <Wrapper style={{maxWidth:'1000px'}} key={site.key} title="Site Management">
                <InfoLine label="Name">{site.name}</InfoLine>
                <InfoLine label="Key">{site.key}</InfoLine>
                <InfoLine label="Source Type">{site.source.type}</InfoLine>
                <InfoBlock label="Workspaces">
                    { this.renderWorkspaces(site.key===this.props.siteKey, this.state.selectedSiteWorkspaces) }
                </InfoBlock>
            </Wrapper>;
        }
    }

    render(){

        if(this.state.configurations===undefined){
            return <Wrapper title="Site Management"><MessageBlock>Loading configurations...</MessageBlock></Wrapper>
        }
   
        if(this.state.configurations.empty)
            return this.renderEmptyConfigurations();

        return (
            <div style={ styles.container }>
                <div style={styles.sitesCol}>
                    <List>
                        <Subheader>All Sites</Subheader>
                        <Fragment>
                        {
                            //$FlowFixMe
                            this.state.configurations.sites.map((item, index)=>{
                            let active = item===this.state.selectedSite;
                            return (<ListItem
                                key={index}
                                style={active? styles.siteActiveStyle : styles.siteInactiveStyle }
                                rightIcon={<IconNavigationCheck color={active?this.props.muiTheme.palette.primary1Color:undefined}  />}
                                onClick={ ()=>{
                                    this.selectSite(item);
                                } } 
                                primaryText={ item.name }
                            />);
                        })}
                        </Fragment>
                    </List>
                </div>
                <div style={styles.selectedSiteCol}>
                    { this.renderSelectedSiteContent(this.state.selectedSite) } 
                </div>
            </div>           
        );
    }
    
}

export default muiThemeable()(Home);