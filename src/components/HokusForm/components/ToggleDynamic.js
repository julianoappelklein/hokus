//@flow

import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip from '../../Tip';
import Toggle from 'material-ui/Toggle';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type ToggleDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    tip: string,
    title: string,
    default: ?bool
}

type ToggleDynamicFieldState = {

}

class ToggleDynamic extends BaseDynamic<ToggleDynamicField,ToggleDynamicFieldState> {

    normalizeState({state, field, stateBuilder} : { state: any, field: ToggleDynamicField, stateBuilder: FormStateBuilder }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default!==undefined?field.default:false;
        }
    }

    getType(){
        return 'boolean';
    }

    renderComponent(){

        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
        
        if(currentPath!==context.parentPath){
            return (null);
        }
        
        let iconButtons = [];
        if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

        return (
        <FormItemWrapper
            control={<Toggle
            label={field.title}
            toggled={context.value===true}
            onToggle={function(e,value){
                context.setValue(value)
            }}
            labelPosition='right' />}
            iconButtons={iconButtons}
        />);
    }
}

export default ToggleDynamic;