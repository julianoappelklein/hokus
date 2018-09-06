//@flow

import * as React from 'react';
import { Route } from 'react-router-dom'
import { Accordion, AccordionItem } from './../../../components/Accordion';
import DangerButton from './../../../components/DangerButton';
import type { WorkspaceHeader } from './../../../types';
import { FlatButton, RaisedButton, TextField } from 'material-ui/';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import { InfoLine } from './shared';

export default function Workspaces(
    props: {
        workspaces: Array<WorkspaceHeader>,
        activeWorkspaceKey: ?string,
        onLocationClick: (location: string)=>void,
        onPublishClick: (warn: bool, workspace: WorkspaceHeader)=>void,
        onStartServerClick: (workspace: WorkspaceHeader)=>void,
        onSelectWorkspaceClick: (workspace: WorkspaceHeader)=>void
    }
){
    let {
        workspaces, activeWorkspaceKey, onLocationClick, onPublishClick, onStartServerClick, onSelectWorkspaceClick
    } = props;
    
    
    return (
        <Accordion style={{ margin:'0 8px' }}>
            { (workspaces||[]).map((workspace,i) => {
                let active = workspace.key===activeWorkspaceKey;
                return (
                <AccordionItem key={i} label={ workspace.key } headStyle={{paddingLeft:'8px', paddingRight:'8px', fontWeight:active?'bold':undefined }}
                    headerLeftItems = {[
                        <FlatButton
                            style={{minWidth: '40px'}}
                            icon={<IconNavigationCheck />}
                            primary={active}
                            onClick={ ()=>onSelectWorkspaceClick(workspace) }
                            />
                    ]}
                    body={
                        <div>
                            <InfoLine label="Location">
                                <TextField id="location" value={workspace.path} readOnly={true} /> 
                                <FlatButton
                                    style={{minWidth:'40px'}}
                                    icon={<IconFileFolder />}
                                    onClick={()=>{ onLocationClick(workspace.path) }}
                                />
                            </InfoLine>
                            <InfoLine childrenWrapperStyle={{marginTop:'8px'}} label="Actions">
                                <RaisedButton
                                    label="Select"
                                    primary={active}
                                    onClick={ ()=>onSelectWorkspaceClick(workspace) }
                                />
                                &nbsp;
                                <FlatButton 
                                    label="Start Server"
                                    onClick={ ()=>{ onStartServerClick(workspace); } }
                                />
                                &nbsp;
                                <DangerButton
                                    onClick={(e, loaded)=>{
                                        onPublishClick(!loaded, workspace);
                                    }}
                                    loadedProps={{ secondary:true }}
                                    button={<FlatButton label="Publish" />} />
                            </InfoLine>
                        </div>
                    }
                />
            )})}
        </Accordion>
    )
}