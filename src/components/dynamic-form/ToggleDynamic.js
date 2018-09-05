import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip from './../Tip';
import Toggle from 'material-ui/Toggle';
import BaseDynamic from './BaseDynamic';

class ToggleDynamic extends BaseDynamic {

    normalizeState({state, field}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default!==undefined?field.default:false;
        }
    }

    getType(){
        return 'boolean';
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