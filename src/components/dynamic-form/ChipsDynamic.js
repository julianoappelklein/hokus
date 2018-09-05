import React from 'react';
import DefaultWrapper from './shared/DefaultWrapper';
import Chips from './../Chips';
import BaseDynamic from './BaseDynamic';

class ChipsDynamic extends BaseDynamic {

    normalizeState({state, field}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || [];
        }
    }

    getType(){
        return 'chips';
    }

    deepEqual(array, otherArray){
        if(array.length !== otherArray.length)
            return false;
        
        for(let i = 0; i < array.length; i++){
            if(array[i] !== otherArray[i])
                return false;
        }

        return true;
    }

    shouldComponentUpdate(nextProps, nextState){
        return (
            !this.deepEqual(this.props.context.value, nextProps.context.value)
            || this.props.context.currentPath !== nextProps.context.currentPath
        );
    }

    onPushItemHandler(val){
        let context = this.props.context;
        let copy = context.value.slice(0);
        copy.push(val);
        context.setValue(copy);
    }

    onSwapHandler(e, {index, otherIndex}){
        let context = this.props.context;
        let val = context.value.slice(0);
        let temp = val[otherIndex];
        val[otherIndex] = val[index];
        val[index] = temp;
        context.setValue(val);
    }

    onRequestDeleteHandler(index){
        let context = this.props.context;
        let copy = context.value.slice(0);
        copy.splice(index,1);
        context.setValue(copy);
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
        
        if(currentPath!==context.parentPath){
            return (null);
        }
        
        return (
        <DefaultWrapper>
            <Chips
                items={context.value}
                sortable={true}
                underlineShow={true}
                fullWidth={true}
                field={field}
                onRequestDelete={this.onRequestDeleteHandler.bind(this)}
                onPushItem={this.onPushItemHandler.bind(this)}
                onSwap={this.onSwapHandler.bind(this)}
            />
        </DefaultWrapper>);
    }
}

export default ChipsDynamic;