import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from 'material-ui/TextField';
import Tip from './../Tip';
import BaseDynamic from './BaseDynamic';

class TextFieldNumberDynamic extends BaseDynamic {

    normalizeState({state, field}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = 0;
        }
    }

    getType(){
        return 'number';
    }

    shouldComponentUpdate(nextProps, nextState){
        return (
            this.props.context.value !== nextProps.context.value
            || this.props.context.currentPath !== nextProps.context.currentPath
        );
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
        
        if(currentPath!==context.parentPath){
            return (null);
        }
        
        let setNumberValue = function(e,value){
            if(value===undefined||value.length===0){
                context.clearValue();
                return;
            }
            context.setValue(parseFloat(value))
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