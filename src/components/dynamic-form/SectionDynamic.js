import React from 'react';
import BaseDynamic from './BaseDynamic';
import dynamicComponentUtils from './shared/dynamic-component-utils';

class SectionDynamic extends BaseDynamic {

    allocateStateLevel(field, parentState, rootState){
        if(field.groupdata===undefined||field.groupdata===true){
            if(parentState[field.key]===undefined)
                parentState[field.key]={};
            return parentState[field.key];
        }
        return parentState;
    }

    extendField(field, fieldExtender){
        fieldExtender.extendFields(field.fields);
    }

    normalizeState({state, field, stateBuilder}){
        stateBuilder.setLevelState(state, field.fields);        
    }

    getType(){
        return 'section';
    }

    buildBreadcumbFragment(node, buttons){
        
    }

    buildPathFragment(node){
        return undefined;
    }

    shouldComponentUpdate(nextProps, nextState){
        return true;
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