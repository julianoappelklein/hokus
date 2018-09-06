//@flow

import React from 'react';
import { List, ListItem } from 'material-ui/List';
import IconChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import dynamicComponentUtils from './shared/dynamic-component-utils';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';

type NestDynamicField  = {
    key: string,
    compositeKey: string,
    type: string,
    title:string,
    fields:Array<any>,
    groupdata: ?bool
};

class NestDynamic extends BaseDynamic<NestDynamicField, void> {

    allocateStateLevel(field : NestDynamicField, parentState : any, rootState : any){
        if(field.groupdata==null||field.groupdata===true){
            if(parentState[field.key]===undefined)
                parentState[field.key]={};
            return parentState[field.key];
        }
        return parentState;
    }

    normalizeState({state, field, stateBuilder} : { state: any, field: NestDynamicField, stateBuilder: any }){
        stateBuilder.setLevelState(state, field.fields);        
    }


    extendField(field : NestDynamicField, fieldExtender : any){
        fieldExtender.extendFields(field.fields);
    }

    getType(){
        return 'nest';
    }

    buildBreadcumbFragment(node : any, buttons : Array<{label:string, node:any}>){
        buttons.push({label: node.field.title, node});
    }

    buildPathFragment(node : any){
        return node.field.key;
    }

    renderComponent(){      
         
        let {context} = this.props;
        let {node, currentPath, nodePath, parentPath} = context;
        let {field} = node;
        
        if(currentPath===parentPath){
            let childLabels = field.fields.map((x) => x.title).join(', ');
            childLabels = `(${childLabels})`;
            return (<List style={{marginBottom:16, padding: 0}}><ListItem
                style={{ border: 'solid 1px #e8e8e8', borderRadius:'7px'}}
                onClick={function(){ context.setPath(node) } }
                leftIcon={<IconFileFolder />}
                rightIcon={<IconChevronRight />}
                primaryText={field.title}
                secondaryText={childLabels}
            /></List>
            );
        }
        
        if(currentPath.startsWith(nodePath)){
            var state = node.state;
            return context.renderLevel({ field, state, parent: node });
        }

        return (null);
    }
}

export default NestDynamic;