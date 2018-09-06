//@flow

import * as React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from 'material-ui/TextField';
import Tip from '../../Tip';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type TextFieldDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    default: ?string,
    multiLine: ?bool,
    tip: ?string,
    title: ?string
}

type TextFieldDynamicState = {
    
}

class TextFieldDynamic extends BaseDynamic<TextFieldDynamicField,TextFieldDynamicState> {

    constructor(props: ComponentProps<TextFieldDynamicField>){
        super(props);
    }

    normalizeState({state, field}: {state: any, field: TextFieldDynamicField}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'string';
    }

    handleChange = (e: Event, value: any)=>{
        this.forceUpdate();
        this.props.context.setValue(value, 250);
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
            control={<TextField
                id={`text-field-${field.key}`}
                onChange={ this.handleChange }
                value={context.value}
                floatingLabelFixed={true}
                multiLine={field.multiLine===true}
                underlineShow={true}
                fullWidth={true}
                floatingLabelText={field.title} />
            }
            iconButtons={iconButtons}
        />);
    }
}

export default TextFieldDynamic;