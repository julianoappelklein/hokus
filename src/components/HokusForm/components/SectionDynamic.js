//@flow

import React from 'react';
import dynamicComponentUtils from './shared/dynamic-component-utils';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase, FormStateBuilder, FieldsExtender } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type SectionDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    title: string,
    fields: Array<any>,
    groupdata: ?bool
}

type SectionDynamicState = {

}


class SectionDynamic extends BaseDynamic<SectionDynamicField, SectionDynamicState>  {

    allocateStateLevel(field: SectionDynamicField, parentState: any, rootState: any){
        if(field.groupdata==null||field.groupdata===true){
            if(parentState[field.key]===undefined)
                parentState[field.key]={};
            return parentState[field.key];
        }
        return parentState;
    }

    extendField(field: SectionDynamicField, fieldsExtender: FieldsExtender){
        fieldsExtender.extendFields(field.fields);
    }

    normalizeState({state, field, stateBuilder} : { state: any, field: SectionDynamicField, stateBuilder: FormStateBuilder }){
        stateBuilder.setLevelState(state, field.fields);        
    }

    getType(){
        return 'section';
    }

    buildBreadcumbFragment(currentNode: DynamicFormNode<SectionDynamicField>, items: Array<{label: string, node:?DynamicFormNode<FieldBase>}>): void{
        
    }

    buildPathFragment(node: DynamicFormNode<SectionDynamicField>, nodeLevel: number, nodes: Array<DynamicFormNode<FieldBase>>): ?string {
        return undefined;
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath, nodePath, parentPath} = context;
        let {field} = node;
        
        if(currentPath===parentPath){
            var state = node.state;
            var level = context.renderLevel({
                field,
                state,
                parent: node.parent
            });

            return (<React.Fragment>
                {field.title?<div style={{padding:'16px 0'}}>{field.title}</div>:undefined} 
                <div style={{padding:'16px 0px 0px 16px', marginBottom:'16px', overflow:'auto', borderLeft: 'solid 10px #eee'}}>{level}</div>
            </React.Fragment>);
        }
        
        if(currentPath.startsWith(nodePath)){
            return context.renderLevel({
                field,
                state: node.state,
                parent: node
            });
        }

        return (null);
    }
}

export default SectionDynamic;