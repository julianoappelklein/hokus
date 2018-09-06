//@flow

import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from 'material-ui/TextField';
import Tip from '../../Tip';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FormStateBuilder, FieldsExtender } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';


type ReadonlyDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    title: string,
    tip: ?string,
    default: ?string,
    multiLine: ?bool
}

type ReadonlyDynamicState = {

}

class ReadonlyDynamic extends BaseDynamic<ReadonlyDynamicField,ReadonlyDynamicState> {

    normalizeState({state, field} : { state: any, field: ReadonlyDynamicField, stateBuilder: FormStateBuilder }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'readonly';
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath, parentPath} = context;
        let {field} = node;
                
        if(currentPath!==parentPath){
            return (null);
        }
        
        let iconButtons = [];
        if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

        return (<FormItemWrapper
            control={<TextField
                underlineFocusStyle={{ borderColor: "#bbb" }}
                textareaStyle={{ color:"#999" }}
                inputStyle={{ color:"#999" }}
                value={context.value||''}
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

export default ReadonlyDynamic;