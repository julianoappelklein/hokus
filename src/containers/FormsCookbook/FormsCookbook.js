//@flow

import * as React from 'react';
import { Route } from 'react-router';
import { samples } from './samples';
import { Form, ComponentRegistry } from './../../components/HoForm';
import dynamicFormComponents from './../../components/HokusForm/components/all'
import { FormBreadcumb } from './../../components/Breadcumb';

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

type FormsCookbookProps = {

}

type FormsCookbookState = {

}

export class FormsCookbook extends React.Component<FormsCookbookProps, FormsCookbookState>{

    render(){
        return <Route path={'/forms-cookbook/:sampleKey'} render={({history,match})=>{ return this.renderWithRoute(match.params.sampleKey) }} />
    }

    renderWithRoute(key: string){
        let sample = samples.find(x => x.key===key);
        if(sample){
            return (
                <Form
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
            )
        }
        return (<p>Sample not found.</p>);
        
    }
    
}