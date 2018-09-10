//@flow

import * as React from 'react';
import { Route } from 'react-router';
import { samples } from './samples';
import { Form, ComponentRegistry } from './../../components/HoForm';
import dynamicFormComponents from './../../components/HokusForm/components/all'
import { FormBreadcumb } from './../../components/Breadcumb';
import { Dialog, RaisedButton } from 'material-ui';

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

type FormsCookbookProps = {

}

type FormsCookbookState = {
    modal: null|'config'|'state'
}

const MenuBar = (props: { onViewStateClick: ()=>void, onViewConfigClick: ()=>void}) =>{
    return <div style={{
        background:'white',
        position:'fixed',
        bottom:0,
        right: '32px',
        padding: '16px',
        zIndex: 2,
        boxShadow: '0px 1px 5px RGBA(0,0,0,.3)'
    }}>
        <RaisedButton onClick={props.onViewConfigClick} label="View Config" />
        <span> </span>
        <RaisedButton onClick={props.onViewStateClick} label="View State" />
    </div>
}

export class FormsCookbook extends React.Component<FormsCookbookProps, FormsCookbookState>{

    formRef: any;

    constructor(props: FormsCookbookProps){
        super(props);
        this.state = {modal: null};
    }

    render(){
        return <Route
            path={'/forms-cookbook/:sampleKey'}
            render={({history,match})=>{
                return this.renderWithRoute(match.params.sampleKey)
            }} />
    }

    handleOnViewStateClick = ()=>{
        this.setState({modal: 'state'});
    }

    handleOnViewConfigClick = ()=>{
        this.setState({modal: 'config'});
    }

    handleModalClose = ()=>{
        this.setState({modal: null});
    }

    handleFormRef = (ref: any)=>{
        this.formRef = ref;
    }

    renderWithRoute(key: string){
        let sample = samples.find(x => x.key===key);
        if(sample){
            return (<React.Fragment>
                    <Form
                        ref={this.handleFormRef}
                        key={key}
                        rootName={sample.title}
                        breadcumbComponentType={FormBreadcumb}
                        fields={sample.fields}
                        debug={false}
                        componentRegistry={componentRegistry}
                        values={sample.values}
                        plugins={{
                            openBundleFileDialog: ()=>{
                                alert('This operation is not supported in the Cookbook. But we\'ll mock something for you.');
                                return Promise.resolve(['some-file.png']);
                            }
                        }}
                    />
                    <MenuBar onViewConfigClick={this.handleOnViewConfigClick} onViewStateClick={this.handleOnViewStateClick} />
                    <div style={{height:'70px'}} />
                    <Dialog
                        title="State"
                        modal={false}
                        open={this.state.modal==='state'}
                        autoScrollBodyContent={true}
                        onRequestClose={this.handleModalClose}>
                        {this.state.modal==='state'? (<pre>{JSON.stringify(this.formRef.getFormDocumentClone(), null, ' ')}</pre>) : (null) }
                    </Dialog>
                    <Dialog
                        title="Config"
                        modal={false}
                        open={this.state.modal==='config'}
                        autoScrollBodyContent={true}
                        onRequestClose={this.handleModalClose}>
                        {this.state.modal==='config'? (<pre>{JSON.stringify(sample.fields, null, ' ')}</pre>) : (null) }
                    </Dialog>
                </React.Fragment>
            )
        }
        return (<p>Sample not found.</p>);
        
    }
    
}