import BaseDynamic from './BaseDynamic';
import dynamicComponentUtils from './shared/dynamic-component-utils';

class PullDynamic extends BaseDynamic {

    allocateStateLevel(field, parentState, rootState){
        if(parentState[field.key]===undefined)
            parentState[field.key]={};
        return parentState[field.key];        
    }

    extendField(field, fieldExtender){
        fieldExtender.extendFields(field.fields);
    }

    normalizeState({state, field, stateBuilder}){
        stateBuilder.setLevelState(state, field.fields);        
    }

    getType(){
        return 'pull';
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