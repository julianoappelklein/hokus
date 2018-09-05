import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import TextField from 'material-ui/TextField';
import Tip from './../Tip';
import BaseDynamic from './BaseDynamic';

class ReadonlyDynamic extends BaseDynamic {

    normalizeState({state, field}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'readonly';
    }

    shouldComponentUpdate(nextProps, nextState){
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
        if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

        return (<FormItemWrapper
            control={<TextField
                underlineFocusStyle={{ borderColor: "#bbb" }}
                textareaStyle={{ color:"#999" }}
                inputStyle={{ color:"#999" }}
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

export default ReadonlyDynamic;