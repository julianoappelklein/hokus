//@flow

import * as React from 'react';
import Border from './Border';
import {Breadcumb, BreadcumbItem} from './Breadcumb';
import dynamicFormComponents from './dynamic-form/all';

//Material UI Components
import FloatingActionButton from 'material-ui/FloatingActionButton'
import Divider from 'material-ui/Divider';

//Material UI Icons
import IconCheck from 'material-ui/svg-icons/navigation/check';

import type { IField, IFieldGroup, DynamicFormNode } from './dynamic-form-types';

const Fragment = React.Fragment;
const componentMarginTop = '16px';

class DynamicFormStateBuilder{

    proplessComponentsDict : any;
    rootState : any;

    constructor(proplessComponentsDict: any, rootState: any){
        this.proplessComponentsDict = proplessComponentsDict;
    }

    makeRootState(fields: Array<any>, refState: any){
        this.rootState = refState;
        this.setLevelState(refState, fields);
    }

    reportDataReplacement(field: any, oldData: any, newData: any){
        console.log('Data replaced for field '+field.key);
    }

    setLevelState(state: any, fields: any){
        for(let i = 0; i < fields.length; i++){
            let field = fields[i];

            let component = this.proplessComponentsDict[field.type];
            if(component){
                state = component.allocateStateLevel(field,state,this.rootState);
                component.normalizeState({
                    state,
                    field,
                    stateBuilder:this
                });               
            }
            else{
                throw new Error('Could not find component of type '+field.type);
            }
        }
    }
}

export class ComponentContext<Field: IField>{

    node: DynamicFormNode<Field>;
    currentNode: DynamicFormNode<Field>;

    nodePath: string;
    parentPath: string;
    currentPath: string;
    proplessInstance : any;

    onValueChanged: ?(value: any)=> void;
    
    form:any;
    value:any;
    
    //remove those?
    renderLevel: any;
    renderField: any;
    setLevelState: any;
    

    constructor(form : any, node : any, currentPath : string, parentPath : string,
        nodePath : string, proplessInstance : any, onValueChanged : ?(value: any)=>void){
        
        this.node = node;
        
        //paths
        this.nodePath = nodePath;
        this.parentPath = parentPath;
        this.currentPath = currentPath;
        this.proplessInstance = proplessInstance;
        this.onValueChanged = onValueChanged;

        //node complete reference. is this a good idea?
        this.currentNode = form.currentNode;

        //need this to trigger updates
        this.form = form;
        
        //functions borowed from the DynamicForm
        this.renderLevel = form.renderLevel.bind(form); //don't know why, but this solved a huge nasty bug!
        this.renderField = form.renderField.bind(form); //don't know why, but this solved a huge nasty bug!
        this.setLevelState = stateBuilder.setLevelState.bind(stateBuilder);
        
        //it's a good ideia to resolve this as soon as possible to use it in the component shouldUpdate method
        this.value = this.proplessInstance.getValue(this);
    }
    
    getValue(){
        return this.value;
    }

    setValue(value : any){
        if(this.onValueChanged){
            this.onValueChanged(value);
            return;
        }
        this.proplessInstance.setValue(this, value);
        this.form.setState({changed: true});
    }

    clearValue(){
        if(this.onValueChanged){
            this.onValueChanged(undefined);
            return;
        }
        this.proplessInstance.clearValue(this);
        this.form.setState({changed: true});
        if(this.onValueChanged)
            this.onValueChanged();
    }

    setPath(node : DynamicFormNode<Field>){
        this.form.setPath(node);
    }

    backOnePath(){
        this.form.setPath(this.currentNode.parent);
    }

    findNodeInCurrentNodeTree(node: DynamicFormNode<Field>){
        let cNode = this.currentNode;
        while(cNode){
            if(cNode.field===node.field)
                return cNode;
            cNode = cNode.parent;
        }
        return undefined;
    }

    findPreviousNodeInCurrentNodeTree(node: DynamicFormNode<Field>){
        let cNode = this.currentNode;
        let pNode = undefined;
        while(cNode){
            if(cNode.field===node.field)
                return pNode;
            pNode = cNode;
            cNode = cNode.parent;
        }
        return undefined;
    }
}

let stateBuilder; 

type DynamicFormProps = {
    values: any,
    fields: Array<any>,
    debug: bool,
    rootName: string,
    onSave: any
}

type DynamicFormState = {
    path: string,
    document: any,
    changed: bool,
    rev: number,
    savedOnce: bool,
    error: ?string
}

class DynamicForm extends React.Component<DynamicFormProps,DynamicFormState> {

    currentNode : DynamicFormNode<IField>;
    dynamicComponents : any;
    cache: any = {};
    root : any;

    constructor(props : DynamicFormProps) {

        //delayed super... ugly
        super(props);

        var dynamicComponents = {};
        let proplessComponentsDict = {};
        for(var key in dynamicFormComponents){
            let classType = dynamicFormComponents[key];
            let proplessInstance = new classType();
            proplessComponentsDict[proplessInstance.getType()] = proplessInstance;
            dynamicComponents[proplessInstance.getType()] = {
                classType,
                proplessInstance
            };
        }

        stateBuilder = new DynamicFormStateBuilder(proplessComponentsDict);

        this.dynamicComponents = dynamicComponents;

        let formState = JSON.parse(JSON.stringify(props.values||{}));
        stateBuilder.makeRootState(props.fields, formState);
        this.root = { isRoot: true, field:{key:'root', type:'root'}, state:null, parent:null, uiState:null };
        this.state = {
            document: formState,
            changed:false,
            savedOnce: false,
            path: 'ROOT/',
            rev:0,
            error:null
        };
        this.currentNode = this.root;
        
    }

    keydownHandler(e : any){
        e = e || window.event;
        var keyCode = e.keyCode || e.which;

        if (e.ctrlKey && keyCode === 83) {
            if(this.state.changed){
                this.saveContent();
            }
            return;
        }        
    }

    componentWillMount(){
        document.addEventListener('keydown', this.keydownHandler.bind(this));
    }

    componentWillUnmount(){
        document.removeEventListener('keydown', this.keydownHandler);
    }

    setPath(node : DynamicFormNode<IField>){
        window.scrollTo(0,0);
        this.currentNode = node;
        this.setState({path: this.buildPath(node)});
    }

    buildPath(currentNode : ?DynamicFormNode<IField>) : string{
        if(currentNode==null)
            return '';
        let path = '';
        let nodes = [];
        let nodeLevel = 0;
        do{
            if(currentNode==null) break;
            nodes.push(currentNode);
            if(currentNode===this.root){
                path = 'ROOT/' + path;
            }
            else{
                let component = this.dynamicComponents[currentNode.field.type];
                if(component){
                    let fragment = component.proplessInstance.buildPathFragment(currentNode, nodeLevel++, nodes);
                    if(fragment) {
                        path = fragment + '/' + path;
                    }
                }
                else{ 
                    throw new Error('Could not find component of type '+currentNode.field.type);
                }
            }
            if(currentNode.parent==null) break;
            else{ currentNode = currentNode.parent; }
        } while(true);

        return path;
    }

    renderField(node : DynamicFormNode<IField>, onValueChanged : ?(value: any) => void){
        var {field} = node;
        let component = this.dynamicComponents[field.type];
        try{

            if(component===undefined)
                throw new Error('Could not find component of type '+field.type);

            node.state = component.proplessInstance.allocateStateLevel(field, node.state, this.state.document);

            let nodePath = this.buildPath(node);
            let parentPath = this.buildPath(node.parent);

            let context = new ComponentContext(this, node, this.state.path, parentPath, nodePath,component.proplessInstance, onValueChanged);

            let DynamicComponent = component.classType;
            return (<DynamicComponent
                key={field.key}
                context={context} />);
        }
        catch(e){
            console.warn(e);
            return (null);
        }
    }

    /**
     * Render a level of components
     * Can be used recursively when called by a component
     * 
     * @field - the parent field config of the level
     * @state - the level state
     * @uiState - hard to describe
     * @parent - the previous renderLevel context object
     */
    renderLevel({ field, state, uiState, parent}: DynamicFormNode<IField&IFieldGroup>): React.Node {

        if(this.props.debug)
            console.log('RENDER LEVEL');

        const fieldsElements = field.fields.map(function(childField){
            let data = {field:childField, state:state, uiState, parent};
            let field = this.renderField(data);
            if(this.props.debug)
                console.log('FIELD', data, field, this.buildPath(data));
            return field;
        }.bind(this));

        return (
            <Fragment>{fieldsElements}</Fragment>
        );
    }

    saveContent(){
        if(this.props.onSave){
            var context = {
                accept: function(updatedValues){
                    //this is a rule dependency that must be resolved in the "server"
                    if(this.state.document.resources){
                        this.state.document.resources = this.state.document.resources.filter(x => !x.__deleted===true);
                    }

                    this.setState({
                        changed: false,
                        savedOnce:true,
                        //document:updatedValues,   //THIS IS A BAD IDEA! BAD WAY TO APPLY CHANGES FROM A SERVER
                                                    //THE FORM WILL HAVE PROBLEMS. WE MUST UPDATE THE DOCUMENT, NOT REPLACE IT
                                                    //THE DOC - AGAINST ALL RECOMMENDATIONS - IS MUTABLE
                                                    // WE MUST FIND A WAY TO UPDATE THIS WITHOUT REPLACING IT
                        rev:++this.state.rev 
                    });
                }.bind(this),
                reject: function(msg){
                    this.setState({error: msg || 'Error'});
                }.bind(this),
                data: Object.assign({}, this.state.document)
            }
            let updatedValues = this.props.onSave.call(this, context);
        }
        else{
            this.setState({error: 'Save not implemented'});
        }        
    }
    
    renderBreadcumb(){
        
        let currentNode = this.currentNode;
        let nodeLevel = 0;
        
        let buttons = [];
        let nodes = [];

        try{
            do{
                nodes.push(currentNode);
                if(currentNode===this.root){
                    buttons.push({label: this.props.rootName||'ROOT', node:currentNode});
                }
                else{
                    let component = this.dynamicComponents[currentNode.field.type];
                    if(component && component.proplessInstance.buildBreadcumbFragment){
                        component.proplessInstance.buildBreadcumbFragment(currentNode, buttons, nodeLevel++, nodes);
                    }
                    else{
                        throw new Error('Could not find component of type '+currentNode.field.type);
                    }
                }
                currentNode = currentNode.parent;
            } while(currentNode);
        }
        catch(e){
            buttons.push({label: 'Error', node:this.root});
        }

        buttons.reverse();

        let breadcumbItems = [];
        for(let i = 0; i < buttons.length;i++){
            let data = buttons[i];
            if(data.node){
                breadcumbItems.push(
                    <BreadcumbItem
                        label={data.label||'Untitled'}
                        onClick={function(){ this.setPath(data.node);}.bind(this)} />
                );
            }
            else{
                breadcumbItems.push(
                    <BreadcumbItem
                        label={data.label||'Untitled'}
                        disabled={true} />
                );
            }
        }
        return (<Breadcumb style={{marginBottom:16}} items={breadcumbItems} />);        
    }

    getCurrentNodeDebugInfo(){
        let path;
        try{
            path = this.buildPath(this.currentNode)
        }
        catch(e){
            path = e;
        }
        return { path: path };
    }
    
    render(){

        let breadcumb = this.renderBreadcumb();

        let floatingActionButtonClass = 'animated';
        if(!this.state.savedOnce) floatingActionButtonClass+=' zoomIn';
        if(this.state.changed) floatingActionButtonClass+=' rubberBand';

        //TODO: review REV in key because it forces all components to rerender
        let form = (<div key={`DynamicForm-rev${'fixed'||this.state.rev}`} style={{padding:'20px'}}>
            
            {breadcumb}
            
            {this.renderLevel({
                field:{fields: this.props.fields, key:'root', type:'root' },
                state:this.state.document,
                uiState: undefined,
                parent: this.root
            })}

            <FloatingActionButton
                style={{
                    position:'fixed',
                    right:40,
                    bottom:'20px',
                    zIndex:3
                }}
                className={floatingActionButtonClass}
                disabled={!this.state.changed}
                primary={'true'}
                onClick={()=> this.saveContent()}
                >
                <IconCheck />
            </FloatingActionButton>
            
            { this.props.debug ?
            <Border style={{marginTop: componentMarginTop, overflow: 'auto'}}>
                <pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                    {JSON.stringify(this.getCurrentNodeDebugInfo())}
                </pre>
                <Divider />
                <pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                    {JSON.stringify(this.state, null,'   ')}
                </pre>
            </Border> : undefined }

            <div style={{height:'70px'}}></div>
            
        </div>);

        return form;
    }
}

export default DynamicForm;