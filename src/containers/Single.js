//@flow

import React from 'react';
import service from './../services/service'
import { snackMessageService } from './../services/ui-service'
import { Redirect } from 'react-router-dom'
import DynamicForm from './../components/DynamicForm';
import Spinner from './../components/Spinner';
import fieldsExtender from './../components/dynamic-form/fields-extender'

import type { Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig, SingleConfig } from './../types';

type SingleProps = {
    siteKey : string,
    workspaceKey: string,
    singleKey: string
}

type SingleState = {
    selectedWorkspaceDetails : ?WorkspaceConfig,
    single : ?SingleConfig,
    singleValues: any
}


class Single extends React.Component<SingleProps,SingleState>{
    constructor(props : SingleProps){
        super(props);
        this.state = {
            selectedWorkspaceDetails: null,
            single: null,
            singleValues: null
        };
    }
    componentWillMount(){
        service.registerListener(this);
    }

    componentDidMount(){
        var stateUpdate  = {};
        var { siteKey, workspaceKey, singleKey } = this.props;
        
        Promise.all([
            service.api.getSingle(siteKey, workspaceKey, singleKey).then((single)=>{
                stateUpdate.singleValues = single;
            }),
            service.api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails)=>{
                stateUpdate.selectedWorkspaceDetails = workspaceDetails;
            })
        ]).then(()=>{
            this.setState(stateUpdate);
        });
        
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }

    onSaveForm(context : any){
        var { siteKey, workspaceKey, singleKey } = this.props;

        let promise = service.api.updateSingle(siteKey, workspaceKey, singleKey, context.data);
        promise.then(function(updatedValues){
            snackMessageService.addSnackMessage("Document saved successfully.")
            context.accept(updatedValues);
        }, function(){
            context.reject('Something went wrong.');
        });
    }
 
    render(){
        if(this.state.singleValues===undefined){
            return <Spinner />;
        }       

        let extendFields = (data)=> {
            let clone = JSON.parse(JSON.stringify(data));
            fieldsExtender.extendFields(clone);
            return clone;
        };

        if(this.state.selectedWorkspaceDetails==null) return null;
        let single = this.state.selectedWorkspaceDetails.singles.find(x => x.key === this.props.singleKey);
        if(single==null) return null;

        return(<DynamicForm
            debug={false}
            rootName={single.title}
            fields={extendFields(single.fields)}
            values={this.state.singleValues}
            trim={false}
            onSave={this.onSaveForm.bind(this)} />
        );        
    }
}

export default Single;