//@flow

import React from 'react';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';
import FormItemWrapper from './shared/FormItemWrapper';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import Tip from '../../Tip';

type SelectDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    default: ?string,
    tip: ?string,
    title: ?string,
    options: Array<{value:string, text:string}>
}

type SelectDynamicState = {
    
}

class SelectDynamic extends BaseDynamic<SelectDynamicField,SelectDynamicState> {

    normalizeState({state, field} : { state: any, field: SelectDynamicField, stateBuilder: FormStateBuilder }){
        //TODO: clear if value is not a valid option
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'select';
    }

    renderComponent(){       
        
        let {context} = this.props;
        let {node, currentPath, parentPath} = context;
        let {field} = node;
                
        if(currentPath!==parentPath){
            return (null);
        }
        
        let iconButtons = [];
        if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

        return (<FormItemWrapper
            control={<SelectField
                underlineShow={true}
                floatingLabelText={field.title}
                floatingLabelFixed={true}
                value={context.value}
                onChange={function(e,index){
                    if(field.options[index].value!==context.value)
                        context.setValue(field.options[index].value)
                }}
                fullWidth={true}
                >
                {field.options.map((option, i)=>(
                    <MenuItem key={i} value={option.value} primaryText={option.text} />
                ))}
            </SelectField>}
            iconButtons={iconButtons}
        />);
    }
}

export default SelectDynamic;