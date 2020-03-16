import * as React from 'react';
import { ComponentContext } from './component-context';
import { Debounce } from './debounce';
import { FieldBase, DynamicFormNode, ComponentProps, BreadcumbComponentType, FormIncludes } from './types';
import { ComponentRegistry } from './component-registry';
import { FormStateBuilder } from './form-state-builder';
import { FieldsExtender } from './fields-extender';
import { traverse, hasValidationErrorInTree } from './utils';

const Fragment = React.Fragment;
const componentMarginTop = '16px';


type FormProps = {
    values: any,
    fields: Array<FieldBase & {[key: string]: any}>,
    debug?: boolean|'value'|'state'|'value-raw',
    rootName: string,
    componentRegistry: ComponentRegistry,
    breadcumbComponentType : BreadcumbComponentType,
    plugins: any,
    includes: FormIncludes,
    onChange?: (data: ()=>any)=>void,
    onPathChange?: (path: string)=>void,
    onDebouncedChange?: ()=>void
}

type FormState = {
    path: string,
    doc: any,
    rawDoc: any,
    docNeedNormalization: boolean,
    fields: Array<any>, //we're going to use the fields from the state instead of the fields from props - it can't mutate
    renderError: string|null
}

export class HoForm extends React.Component<FormProps,FormState> {

    currentNode : DynamicFormNode<FieldBase>|null;
    root : DynamicFormNode<FieldBase>;
    cache: any = {};
    stateBuilder: FormStateBuilder;
    forceUpdateThis: ()=>void;

    constructor(props : FormProps) {

        super(props);
        this.stateBuilder = new FormStateBuilder(this.props.componentRegistry, props.includes);
        const fieldsExtender = new FieldsExtender(this.props.componentRegistry, this.props.includes);
        fieldsExtender.extendFields(props.fields);
        Object.keys(props.includes).forEach(includeKey => {
            fieldsExtender.extendFields(props.includes[includeKey]);
        })

        let formState = JSON.parse(JSON.stringify(props.values||{}));
        this.stateBuilder.makeRootState(props.fields, formState);

        let root = {
            field:{
                key:'root',
                type:'root'
            },
            state: null,
            parent: (null/*: ?DynamicFormNode<FieldBase>*/)
        };
        this.root = root; 
        this.currentNode = root;
        this.state = {
            rawDoc: props.values,
            doc: formState,
            docNeedNormalization: true,
            path: 'ROOT/',
            fields: props.fields,
            renderError: null
        };

        this.forceUpdateThis = ()=>{
            this.forceUpdate();
            if(this.props.onDebouncedChange){
                this.props.onDebouncedChange();
            }
        };
        this.getFormDocClone = this.getFormDocClone.bind(this);
        
    }

    static getDerivedStateFromProps(props: FormProps, state: FormState){
        if(props.values!=state.rawDoc){
            return { documentNeedNormalization: true, rawDoc: props.values, document: props.values };
        }
        else{
            return null;
        }
    }

    normalizeDocSilently(){
        if(this.state.docNeedNormalization){
            let formState = JSON.parse(JSON.stringify(this.props.values||{}));
            this.stateBuilder.makeRootState(this.state.fields, formState);
            const silentUpdate = (s: any, document: any)=>{               
                s.doc = document;
                s.docNeedNormalization = false;
            }
            silentUpdate(this.state, formState);
        }
    }

    componentDidCatch(error: Error , info: React.ErrorInfo) {
        this.setState({ renderError: error.message });
        console.warn(error, info);
    }

    setPath(node : DynamicFormNode<FieldBase>){
        const path = this.buildDisplayPath(node);
        if(path!=this.state.path){
            this.currentNode = node;
            this.setState({path: this.buildDisplayPath(node)});
            if(this.props.onPathChange){
                this.props.onPathChange(path);
            }
        }
    }

    buildDisplayPath(currentNode : DynamicFormNode<FieldBase>|null) : string{
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
                let componentProplessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
                if(componentProplessInstace){
                    let fragment = componentProplessInstace.buildDisplayPathFragment(currentNode, nodeLevel++, nodes);
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

    crawl(){
        //this.stateValidator.resetValidation();
        this.crawlLevel({
            fields: this.state.fields,
            state: this.state.doc,
            parent: this.root
        });
    }

    isValid(): boolean{
        this.crawl();
        (window as any).formstate = this.state;
        const hasErrors = hasValidationErrorInTree(this.state.doc);
        return !hasErrors;
    }

    getValues(): any{
        return JSON.parse(JSON.stringify(this.state.doc));
    }

    /**
     * Crawl a level of components
     * Can be used recursively when called by a component
     * 
     * @field - the parent field config of the level
     * @state - the level state
     * @parent - the previous renderLevel context object
     */
    crawlLevel({ fields, state, parent}: { fields: Array<FieldBase>|null, state: any, parent: DynamicFormNode<FieldBase> }) {

        if(this.props.debug) console.log('CRAWL LEVEL');

        (fields||[]).forEach((childField: FieldBase) => {
            let data = {field:childField, state:state, parent};
            let field = this.crawlField(data);
            if(this.props.debug){
                console.log('FIELD', data, field);
                console.log(this.buildDisplayPath(data));
            }

        });
    }

    crawlField(node : DynamicFormNode<FieldBase>){
        var {field} = node;
        let component = this.props.componentRegistry.get(field.type);
        try{
            if(component==null) throw new Error('Could not find component of type '+field.type);
            node.state = component.proplessInstance.allocateStateLevel(field, node.state, this.state.doc);
            component.proplessInstance.crawlComponent({ form:this, node });
        }
        catch(e){ console.warn(e); }
    }

    /**
     * Render a level of components
     * Can be used recursively when called by a component
     * 
     * @field - the parent field config of the level
     * @state - the level state
     * @parent - the previous renderLevel context object
     */
    renderLevel({ fields, state, parent}: { fields: Array<FieldBase>|null, state: any, parent: DynamicFormNode<FieldBase> }): React.ReactNode {

        if(this.props.debug)
            console.log('RENDER LEVEL');

        const fieldsElements = (fields||[]).map((childField: FieldBase) => {
            let node = {field:childField, state:state, parent};
            let field = this.renderField(node);
            if(this.props.debug){
                console.log('FIELD', node, field);
                console.log(this.buildDisplayPath(node));
            }
            return field;
        });

        return (
            <Fragment>{fieldsElements}</Fragment>
        );
    }

    renderField(node : DynamicFormNode<FieldBase>, onValueChanged : ((value: any) => void)|null = null){
        var {field} = node;
        let component = this.props.componentRegistry.get(field.type);
        try{

            if(component==null)
                throw new Error('Could not find component of type '+field.type);

            node.state = component.proplessInstance.allocateStateLevel(field, node.state, this.state.doc);

            let nodePath = this.buildDisplayPath(node);
            let parentPath = this.buildDisplayPath(node.parent);

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

    getFormDocClone = ()=>{
        var clone = JSON.parse(JSON.stringify(this.state.doc));
        traverse(clone, (obj, prop, value)=>{
            // if(prop.startsWith('__virtual_')){
            //     let keys = Object.keys(obj[prop]);
            //     for (let i = 0; i < keys.length; i++) {
            //         const key = keys[i];
            //         obj[key] = obj[prop][key];
            //     }
            // }
            if(prop.startsWith('__')){
                delete obj[prop];
            }
        });
        return clone;
    }

    forceUpdateDebounce: Debounce = new Debounce();
    handleChange(node: any, debounce: number){
        this.forceUpdateDebounce.run(this.forceUpdateThis, debounce);
        
        if(this.props.onChange!=null){
            this.props.onChange(
                this.getFormDocClone
            );
        }
    }
   
    renderBreadcumb(){
        
        let currentNode = this.currentNode;
        
        let items = [];
        let nodes = [];

        try{
            do{
                nodes.push(currentNode);
                if(currentNode===this.root){
                    items.push({label: this.props.rootName||'ROOT', node:currentNode});
                }
                else{
                    if(currentNode==null) throw new Error('Null pointer exception.');
                    let componentPropslessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
                    if(componentPropslessInstace && componentPropslessInstace.buildBreadcumbFragment){
                        componentPropslessInstace.buildBreadcumbFragment(currentNode, items);
                    }
                    else{
                        throw new Error('Could not find component of type '+currentNode.field.type);
                    }
                }
                currentNode = currentNode.parent;
            } while(currentNode);
        }
        catch(e){
            items.push({label: 'Error', node:this.root});
        }

        items.reverse();

        let Breadcumb = this.props.breadcumbComponentType;
        return <Breadcumb items={items} onNodeSelected={this.setPath.bind(this)} />;       
    }

    getCurrentNodeDebugInfo(){
        let path;
        try{
            path = this.buildDisplayPath(this.currentNode)
        }
        catch(e){
            path = e;
        }
        return { path: path };
    }
    
    render(){

        if(this.state.renderError)
            return (<p style={{color:'red', padding:'24px'}}>{this.state.renderError}</p>)

        this.normalizeDocSilently();

        let breadcumb = this.renderBreadcumb();

        //crawl without rendering, to resolve if the state is valid
        this.crawl();
      
        const debug = this.props.debug;
        let form = (<div key={'dynamic-form'}>
            
            {breadcumb}
            
            {this.renderLevel({
                fields: this.state.fields,
                state: this.state.doc,
                parent: this.root
            })}

            { debug && (<div style={{marginTop: componentMarginTop, overflow: 'auto', border: 'solid 1px #e8e8e8', borderRadius:'7px'}}>
                <pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                    {JSON.stringify(this.getCurrentNodeDebugInfo())}
                </pre>
                
                { (debug===true||debug==='state'||debug==='value'||debug==='value-raw') && (<pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                    {JSON.stringify(debug==='state' ? this.state : debug==="value-raw" ? this.state.doc : this.getFormDocClone(), null,'   ')}
                </pre>) }

                {/* { (debug===true||debug==='validation'||debug==='value+validation') && (<pre style={{padding:16, margin:0, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                    {JSON.stringify(this.stateValidator.getValidation(), null,'   ')}
                </pre>) } */}
            </div>) }
            
            
        </div>);

        return form;
    }
}