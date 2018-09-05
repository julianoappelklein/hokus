//@flow
import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from 'material-ui/TextField';
import Tip from './../Tip';
import BaseDynamic from './BaseDynamic';

import type { DynamicFormNode, ComponentProps } from './../dynamic-form-types';
import type { ComponentContext } from './../DynamicForm';

type TextFieldDynamicField = {
    key: string,
    type: string,
    default: ?string,
    multiLine: ?bool,
    tip: ?string,
    title: ?string
}

class TextFieldDynamic extends BaseDynamic<TextFieldDynamicField,void> {

    normalizeState({state, field}: {state: any, field: TextFieldDynamicField}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'string';
    }

    shouldComponentUpdate(nextProps: ComponentProps<TextFieldDynamicField>, nextState: void){
        return (
            this.props.context.value !== nextProps.context.value
            || this.props.context.currentPath !== nextProps.context.currentPath
        );
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
                onChange={(e,value)=>{ context.setValue(value) }}
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