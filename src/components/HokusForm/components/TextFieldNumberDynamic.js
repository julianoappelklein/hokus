//@flow

import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from 'material-ui/TextField';
import Tip from '../../Tip';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type TextFieldNumberDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    tip: string,
    title: string,
    default: ?number
}

type TextFieldNumberDynamicState = {

}

class TextFieldNumberDynamic extends BaseDynamic<TextFieldNumberDynamicField,TextFieldNumberDynamicState>  {

    normalizeState({state, field} : { state: any, field: TextFieldNumberDynamicField, stateBuilder: FormStateBuilder }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default||0;
        }
    }

    getType(){
        return 'number';
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
        
        if(currentPath!==context.parentPath){
            return (null);
        }
        
        let setNumberValue = (e,value) => {
            if(value===undefined||value.length===0){
                context.clearValue();
                return;
            }
            this.forceUpdate();
            context.setValue(parseFloat(value),250);
        };

        let getNumberValue = function(){
            return (context.value||'').toString();
        };

        let iconButtons = [];
        if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

        return (
            <FormItemWrapper
                control={<TextField
                    id={`text-field-${field.key}`}
                    onChange={ setNumberValue }
                    value={getNumberValue()}
                    type={'number'}
                    floatingLabelFixed={true}
                    underlineShow={true}
                    fullWidth={true}
                    floatingLabelText={field.title} />
                }
                iconButtons={iconButtons}
            />
        );
    }
}

export default TextFieldNumberDynamic;