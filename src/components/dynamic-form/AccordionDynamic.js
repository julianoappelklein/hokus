import React from 'react';
import { Accordion, AccordionItem } from './../Accordion'
import { List, ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconRemove from 'material-ui/svg-icons/content/clear';
import IconSort from 'material-ui/svg-icons/editor/drag-handle';
import IconChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import BaseDynamic from './BaseDynamic';
import { FlatButton } from 'material-ui';
import DangerButton from '../DangerButton';
import dynamicComponentUtils from './shared/dynamic-component-utils'
//import cyan500 from 'material-ui/styles/colors'

const Fragment = React.Fragment;

class AccordionDynamic extends BaseDynamic {

    constructor(props){
        super(props);
        this.state = {index: -1};
    }

    extendField(field, fieldExtender){
        fieldExtender.extendFields(field.fields);
    }

    getType(){
        return 'accordion';
    }

    normalizeState({state, field, stateBuilder}){
        dynamicComponentUtils.normalizeStateForArrayOfObject(state, field, stateBuilder);
    }

    buildBreadcumbFragment(node, buttons, nodeLevel, nodes){
        if(nodeLevel > 0)
            buttons.push({label: '' + nodes[nodeLevel-1].uiState.childIndex, undefined});
        buttons.push({label: node.field.title, node:node});
    }

    buildPathFragment(node, nodeLevel, nodes){
        if(nodeLevel > 0)
            return node.field.key + '/' + nodes[nodeLevel-1].uiState.childIndex;
        return node.field.key;        
    }

    shouldComponentUpdate(nextProps, nextState){
        return true;
    }

    onAddClickHandler(){
        let context = this.props.context;
        let copy = context.value.slice(0);
        let newData = {};
        context.setLevelState(newData, context.node.field.fields);
        copy.push(newData);
        context.setValue(copy);
    };

    removeItemAtIndex(i){
        let context = this.props.context;
        let copy = context.value.slice(0);
        copy.splice(i, 1);
        context.setValue(copy);        
    }

    swapItems({index, otherIndex}){
        if(index===otherIndex)
            return;
        let context = this.props.context;
        let copy = context.value.slice(0);
        let temp = copy[index];
        copy[index] = copy[otherIndex];
        copy[otherIndex] = temp;
        context.setValue(copy);
    }

    //DRAG EVENTS
    getDocumentMouseUpListener(){
        this.documentMouseUpListener = function(e){
            
            this.swapItems({index:this.state.dragFromIndex, otherIndex:this.state.dragToIndex});   
            this.setState({ dragFromIndex: undefined, dragToIndex:undefined });
            document.removeEventListener('mouseup', this.documentMouseUpListener);
        }.bind(this)
        return this.documentMouseUpListener;
    }

    getOnItemDragHandleMouseDown(index){
        return function(e){
            if(true /*this.props.sortable*/){
                this.setState({ dragFromIndex: index, dragToIndex: index, index:-1 });
                document.addEventListener('mouseup', this.getDocumentMouseUpListener());
            }
        }.bind(this)
    }

    getOnItemMouseEnter(index){
        return function(e){           
            if(this.state.dragFromIndex!==undefined){
                this.setState({dragToIndex: index});
            }
        }.bind(this)
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
                secondaryText={context.value.length +' items'}
                /></List>
            );
        }

        if(currentPath===context.nodePath){
            let { dragToIndex, dragFromIndex } = this.state;

            let renderItem = (item, childIndex, isDragging)=>{

                let label = 'Untitled';

                let newNode = {
                    field,
                    state: context.value[childIndex],
                    uiState:{childIndex},
                    parent: node
                };

                let arrayTitle = field.fields.find((x)=>x.arrayTitle===true);
                if(arrayTitle && newNode.state[arrayTitle.key]){
                    label = newNode.state[arrayTitle.key];
                }

                let background;
                if(isDragging){
                    background = '#eee';
                }

                return (
                    <AccordionItem
                        key={childIndex}
                        label={label}
                        style={{marginTop:8, background}}
                        bodyStyle={{padding:'16px 16px 0px 16px'}}
                        body={context.renderLevel(newNode)}
                        wrapperProps={{
                            onMouseEnter: this.getOnItemMouseEnter(childIndex)
                        }}
                        headerRightItems={[
                            <FlatButton
                                onClick={(e)=>{e.stopPropagation()}}
                                onMouseDown={this.getOnItemDragHandleMouseDown(childIndex)}
                                style={{minWidth:40, cursor: 'move'}} icon={<IconSort opacity={.3} />} />,
                            <DangerButton
                                onClick={(e, loaded)=>{
                                    e.stopPropagation();
                                    if(loaded){
                                        this.removeItemAtIndex(childIndex)
                                    }
                                }}
                                loadedButton={<FlatButton secondary={true} style={{minWidth:40}} icon={<IconRemove />} />}
                                button={<FlatButton style={{minWidth:40}} icon={<IconRemove opacity={.3} />} />}
                            />
                        ]}
                    />
                );
            };

            return (<Fragment>
                <Accordion index={this.state.index} onChange={(index)=>{
                    this.setState({index:this.state.index===index?-1:index});
                }}>
                    {context.value.map((item, childIndex)=>{
                        if(childIndex===dragFromIndex){
                            return renderItem(item, childIndex, true);
                        }
                        
                        if(childIndex===dragToIndex){
                            let movedItem = <div style={{margin:'8px 0', height:'8px', background:'#00bcd4'/*cyan500*/, borderRadius:3}}></div>;
                            let beforeItem, afterItem;
                            if(dragFromIndex < dragToIndex)
                                afterItem = movedItem;
                            else
                                beforeItem = movedItem;
                            return <Fragment key={'item'+childIndex}>
                                {beforeItem}
                                {renderItem(item,childIndex)}
                                {afterItem}
                            </Fragment>
                        }
                        else{
                            return renderItem(item, childIndex);
                        }
                    })}
                </Accordion>
                <RaisedButton
                    style={{marginTop:'16px'}}
                    onClick={this.onAddClickHandler.bind(this)}
                    icon={<IconAdd />}
                    />
            </Fragment>);
        }

        if(currentPath.startsWith(context.nodePath)){

            let matchedNode = context.findPreviousNodeInCurrentNodeTree(node);
            return (context.renderLevel({
                field,
                state: context.value[matchedNode.uiState.childIndex],
                uiState: {childIndex:matchedNode.uiState.childIndex},
                parent: node 
            }));
            
        }

        return (null);
    }
}

export default AccordionDynamic;