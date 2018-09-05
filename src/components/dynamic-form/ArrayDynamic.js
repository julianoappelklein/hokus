import React from 'react';
import ArrayListManager from './../ArrayListManager';
import { List, ListItem } from 'material-ui/List';
import IconChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import BaseDynamic from './BaseDynamic';
import dynamicComponentUtils from './shared/dynamic-component-utils';

class ArrayDynamic extends BaseDynamic {

    normalizeState({state, field, stateBuilder}){
        dynamicComponentUtils.normalizeStateForArrayOfObject(state, field, stateBuilder);
    }

    extendField(field, fieldExtender){
        fieldExtender.extendFields(field.fields);
    }

    getType(){
        return 'array';
    }

    buildBreadcumbFragment(node, buttons){
        if(node.uiState!==undefined&&node.uiState.index!==undefined){
            let arrayTitleField = node.field.fields.find((x)=> x.arrayTitle);
            let itemTitle;
            if(arrayTitleField)
                itemTitle = node.state[node.field.key][node.uiState.index][arrayTitleField.key];
            else
                itemTitle = node.uiState.index+'';
            buttons.push({label: itemTitle, node});
            buttons.push({label: node.field.title, node: Object.assign({}, node, {uiState:undefined})});
        }
        else{
            buttons.push({label: node.field.title, node:node});
        }
    }

    buildPathFragment(node){
        if(node.uiState!==undefined&&node.uiState.index!==undefined){
            return node.field.key + '/' + node.uiState.index;
        }
        else{
            return node.field.key;
        }
    }


    shouldComponentUpdate(nextProps, nextState){
        return true; //we must let reacto to crawl the sub-tree
    }

    renderComponent(){       
        
        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
                
        if(currentPath===context.parentPath){
            return (<List style={{marginBottom:16, padding: 0}}><ListItem
                style={{ border: 'solid 1px #e8e8e8', borderRadius:'7px'}}
                onClick={ function(){ context.setPath(node) } }
                leftIcon={<IconFileFolder />}
                rightIcon={<IconChevronRight />}
                primaryText={field.title}
                secondaryText={context.value.length +' items' }
                /></List>
            );
        }

        if(currentPath===context.nodePath){
            return (<ArrayListManager
                key={field.key+'-list'}
                field={field}
                items={context.value}
                onAddNewClickHandler={function(){
                    let copy = context.value.slice(0);
                    let newData = {};
                    context.setLevelState(newData, field.fields);
                    copy.push(newData);
                    context.setValue(copy);
                }}
                // onItemsSwappedHandler={this.getOnArrayItemsSwappedHandler(arrayData)}
                onItemClickHandler={ (function(e,index){
                    let newNode = Object.assign( {}, node, {uiState:{index}} )
                    context.setPath(newNode);
                }) }
                // onItemDeleteHandler={function(e,i){ this.deleteArrayItem(arrayData, i) }.bind(this)}
                // onItemTitleChangeValueHandler={ (function(e, index, titleKey, newValue){
                //     this.applyPropValueChange(arrayData[index], titleKey, newValue);
                // }).bind(this)}
                />
            );
        }  

        if(currentPath.startsWith(context.nodePath)){
            
            let matchedNode = context.findNodeInCurrentNodeTree(node);
            return (context.renderLevel({
                field,
                state: context.value[matchedNode.uiState.index],
                parent: Object.assign( {}, node, {uiState: {index:matchedNode.uiState.index}} )
            }));
        }

        return (null);
    }
}

export default ArrayDynamic;