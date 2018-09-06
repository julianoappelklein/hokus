//@flow

import React from 'react';
import DefaultWrapper from './shared/DefaultWrapper';
import Chips from '../../Chips';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type ChipsDynamicField = {
    type: string,
    key: string,
    compositeKey: string,
    default: ?Array<string>
}

type ChipsDynamicState = {

}

class ChipsDynamic extends BaseDynamic<ChipsDynamicField, ChipsDynamicState> {

    normalizeState({state, field, stateBuilder} : { state: any, field: ChipsDynamicField, stateBuilder: FormStateBuilder }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || [];
        }
    }

    getType(){
        return 'chips';
    }

    deepEqual(array: Array<string>, otherArray: Array<string>){
        if(array.length !== otherArray.length)
            return false;
        
        for(let i = 0; i < array.length; i++){
            if(array[i] !== otherArray[i])
                return false;
        }

        return true;
    }

    handlePushItem(val: string){
        let context = this.props.context;
        let copy = context.value.slice(0);
        copy.push(val);
        context.setValue(copy);
    }

    handleSwap(e: Event, {index, otherIndex}: {index: number, otherIndex: number}){
        let context = this.props.context;
        let val = context.value.slice(0);
        let temp = val[otherIndex];
        val[otherIndex] = val[index];
        val[index] = temp;
        context.setValue(val);
    }

    handleRequestDelete(index: number){
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
                onRequestDelete={this.handleRequestDelete.bind(this)}
                onPushItem={this.handlePushItem.bind(this)}
                onSwap={this.handleSwap.bind(this)}
            />
        </DefaultWrapper>);
    }
}

export default ChipsDynamic;