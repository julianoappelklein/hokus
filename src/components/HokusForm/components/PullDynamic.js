// @flow

import { BaseDynamic } from '../../HoForm';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FieldsExtender, FormStateBuilder } from '../../HoForm';
import dynamicComponentUtils from './shared/dynamic-component-utils';

type PullDynamicField = {
    type: string,
    key: string,
    group: ?string,
    compositeKey: string,
    fields: Array<any>
}

type PullDynamicState = {
    
}

class PullDynamic extends BaseDynamic<PullDynamicField, PullDynamicState> {

    allocateStateLevel(field: PullDynamicField, parentState: any, rootState: any){
        let key = field.group||field.key;
        if(parentState[key]===undefined)
            parentState[key]={};
        return parentState[key];        
    }

    extendField(field: PullDynamicField, fieldExtender: FieldsExtender){
        fieldExtender.extendFields(field.fields);
    }

    normalizeState({state, field, stateBuilder} : { state: any, field: PullDynamicField, stateBuilder: FormStateBuilder }){
        stateBuilder.setLevelState(state, field.fields);        
    }

    getType(){
        return 'pull';
    }

    buildBreadcumbFragment(node : any, buttons : Array<{label:string, node:any}>){
        
    }

    buildPathFragment(node: DynamicFormNode<PullDynamicField>){
        return undefined;
    }

    renderComponent(){      
         
        let {context} = this.props;
        let {node, currentPath, nodePath} = context;
        let {field} = node;
               
        if(currentPath.startsWith(nodePath)){
            var state = node.state;
            return context.renderLevel({ field, state, parent: node });
        }

        return (null);
    }
}

export default PullDynamic;