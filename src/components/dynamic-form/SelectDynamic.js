import React from 'react';
import BaseDynamic from './BaseDynamic';
import FormItemWrapper from './shared/FormItemWrapper';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';



import Tip from './../Tip';

class SelectDynamic extends BaseDynamic {

    normalizeState({state, field, stateBuilder}){
        //TODO: clear if value is not a valid option
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'select';
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