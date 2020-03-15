//@flow
import * as React from 'react';
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from 'material-ui';
import { SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../../types';

type PublishSiteDialogProps = {
    site: SiteConfig,
    workspace: WorkspaceConfig,
    workspaceHeader: WorkspaceHeader,
    open: boolean,
    onCancelClick: ()=>void,
    onBuildAndPublishClick: (data: {siteKey: string, workspaceKey:string, build:string, publish:string})=>void
}

type PublishSiteDialogState = {
    build: string,
    publish: string
}

export default class PublishSiteDialog extends React.Component<PublishSiteDialogProps,PublishSiteDialogState>{
    
    constructor(props: PublishSiteDialogProps){
        super(props);
        this.state = {
            build: '',
            publish: ''
        }
    }


    handleCancelClick = () => {
        this.props.onCancelClick();
    }

    handleBuildAndPublishClick = () => {
        this.props.onBuildAndPublishClick({
            siteKey:this.props.site.key,
            workspaceKey: this.props.workspaceHeader.key,
            build: this.state.build,
            publish: this.state.publish
        });
    }

    handlePublishChange = (e: any, index: number) => {
        this.setState({publish: this.props.site.publish[index].key});
    }

    handleBuildChange = (e: any, index: number) => {
        this.setState({build: this.props.workspace.build[index].key});
    }

    validate(){
        return this.state.build!==''&&this.state.publish!=='';
    }

    render(){

        let { open, workspace, site } = this.props;
        let { build, publish } = this.state;
        
        let valid = this.validate();

        const actions = [
            <FlatButton
                label="Cancel"
                primary={false}
                onClick={this.handleCancelClick.bind(this)}
            />,
            <FlatButton
                disabled={!valid}
                label="Build and Publish"
                primary={true}
                onClick={this.handleBuildAndPublishClick}
            />,
        ];

        return (
            <Dialog
                title="Publish Site"
                open={open}
                actions={actions}
            >
                <TextField floatingLabelText={'Site'} fullWidth value={this.props.site.key} />
                <TextField floatingLabelText={'Workspace'} fullWidth value={this.props.workspaceHeader.key} />
                <SelectField
                    onChange={this.handleBuildChange}
                    fullWidth
                    value={workspace.build.findIndex(x => x.key===build)}
                    floatingLabelText="Build Config *">
                    {this.props.workspace.build.map((build, i)=>(
                        <MenuItem
                            key={`build-${i}`} value={i}
                            primaryText={build.key}
                            secondaryText={build.config}
                        />
                    ))}
                </SelectField>
                <SelectField
                    onChange={this.handlePublishChange}
                    fullWidth
                    value={site.publish.findIndex(x => x.key===publish)}
                    floatingLabelText="Publish Config *">                        
                    {this.props.site.publish.map((publish, i)=>(
                        <MenuItem
                            key={`publish-${i}`} value={i}
                            primaryText={publish.key||'default'}
                            secondaryText={publish.config.type}
                        />
                    ))}
                </SelectField>
            </Dialog>
        );
    }

}