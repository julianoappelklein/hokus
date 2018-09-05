import React from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import DatePicker from 'material-ui/DatePicker';
import Tip from './../Tip';
import BaseDynamic from './BaseDynamic';
import IconClear from 'material-ui/svg-icons/content/clear';
import IconButton from 'material-ui/IconButton';

class DateDynamic extends BaseDynamic {

    normalizeState({state, field}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || undefined;
        }

        if(state[key]==='now')
        {
            let date = new Date();
            state[key] = '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +  date.getDate();
        }
    }

    getType(){
        return 'date';
    }

    shouldComponentUpdate(nextProps, nextState){
        return (
            this.props.context.value !== nextProps.context.value
            || this.props.context.currentPath !== nextProps.context.currentPath
        );
    }

    getDateValue(){
        let val = this.props.context.value;
        if(val==='now'){
            return new Date();
        }
        else if(val){
            let values = val.split('-');
            let year = parseInt(values[0],10);
            let month = parseInt(values[1],10)-1;
            let day = parseInt(values[2],10);
            return new Date(year, month, day, 12);    
        }
        return undefined;
    }

    setDateValue(value){

        function toStringWithZeros(value, length){
            let str = value.toString();
            while(str.length<length)
                str = '0'+str;
            return str;
        }

        let year = toStringWithZeros(value.getFullYear(),4);
        let month = toStringWithZeros(value.getMonth()+1,2);
        let day = toStringWithZeros(value.getDate(),2);
        let dateStr = `${year}-${month}-${day}`;
        this.props.context.setValue(dateStr);
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
        
        if(currentPath!==context.parentPath){
            return (null);
        }
        
        let iconButtons = [];
        iconButtons.push(<IconButton onClick={()=>context.clearValue()}><IconClear /></IconButton>);
        if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

        return (
            <FormItemWrapper
                control={<DatePicker
                    value={this.getDateValue()}
                    onChange={function(e,value){ this.setDateValue(value) }.bind(this)}
                    floatingLabelFixed={true}
                    autoOk={true}
                    fullWidth={true}
                    underlineShow={true}
                    floatingLabelText={field.title} />
                }
                iconButtons={iconButtons}
            />
        );
    }
}

export default DateDynamic;