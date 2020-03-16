import * as React from 'react';
import { BaseDynamic } from './BaseDynamic';
import { NormalizeStateContext, CrawlContext, ExtendFieldContext } from './types';

type IncludeDynamicField  = {
    key: string,
    type: string,
    include: string
};

export class IncludeDynamic extends BaseDynamic<IncludeDynamicField, {}> {

    allocateStateLevel(field : IncludeDynamicField, parentState : any, rootState : any){
        return parentState;
    }

    normalizeState({state, field, stateBuilder, includes} : NormalizeStateContext<IncludeDynamicField>){
        stateBuilder.setLevelState(state, includes[field.include]);
    }

    extendField({field, extender, includes} : ExtendFieldContext<IncludeDynamicField>): void{    
        //extender.extendFields(includes[field.include]);
    }

    getType(){
        return 'include';
    }

    crawlComponent({form, node} : CrawlContext<IncludeDynamicField>): void{
        const { field, state } = node;
        form.crawlLevel({fields: form.props.includes[field.include], state, parent:node.parent as any});
    }

    renderComponent(){      
        let {context} = this.props;
        let {node, currentPath, parentPath } = context;
        let {field} = node;
        
        if(currentPath.startsWith(parentPath)){
            var state = node.state;
            return context.form.renderLevel({ fields: context.form.props.includes[field.include], state, parent: node.parent as any });
        }

        return (null);
    }
}