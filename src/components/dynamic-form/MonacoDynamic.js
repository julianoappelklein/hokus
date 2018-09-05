//@flow

import React from 'react';
import Tip from './../Tip';
import DefaultWrapper from './shared/DefaultWrapper';
import IconButton from 'material-ui/IconButton';
import IconFullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import IconFullscreenExit from 'material-ui/svg-icons/navigation/fullscreen-exit';
import Paper from 'material-ui/Paper';
import MarkdownIt from 'markdown-it'
import BaseDynamic from './BaseDynamic';
import * as monaco from 'monaco-editor';
import type { DynamicFormNode, ComponentProps, IField } from './../dynamic-form-types';
import type { ComponentContext } from './../DynamicForm';

let editorBackground = '#f3f3f3';
(function defineHokusTheme(){
    
    /*
    let shortCodeTokenizer = [/({{%.+?%}}|{{<.+?>}})/, "hugo-shortcode"];
    
    monaco.languages.setMonarchTokensProvider('markdown', { 
        tokenizer: { root: [ shortCodeTokenizer ] }
    });

    monaco.languages.setMonarchTokensProvider('html', {
        tokenizer: { root: [ shortCodeTokenizer ] }
    });
    */

    if(false){
        editorBackground = '#1E1729';
        monaco.editor.defineTheme('hokus', {
            base: 'vs-dark', // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [
                { token: 'hugo-shortcode', foreground: '933ec5', fontWeight: 'bold' }
            ],
            colors: { 'editor.background': editorBackground }
        });
    }
    else{
        editorBackground = '#eeeeee';
        monaco.editor.defineTheme('hokus', {
            base: 'vs', // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [
                { token: 'hugo-shortcode', foreground: '933ec5', fontWeight: 'bold' }
            ],
            colors: { 'editor.background': editorBackground }
        });
    }
})();

const md = new MarkdownIt({html:true});

type MarkdownDynamicField = {
    key: string,
    type: string,
    default: ?string,
    tip: ?string,
    multiLine: ?bool,
    language: ?string
}

type MarkdownDynamicState = {
    preview: ?string
}

function debounce(fn: ()=>void, delay: number) {
    var timer: ?TimeoutID = null;
    return function () {
        let context = this;
        let args = arguments;
        if(timer!=null)
            clearTimeout(timer);
        timer = setTimeout(function () {
        fn.apply(context, args);
        }, delay);
    };
}

class Debounce{

    _time: number;
    _timeoutID: TimeoutID;

    constructor(time){
        this._time  = time;
    }

    run(action: ()=> void){
        this.cancelNext();
        this._timeoutID = setTimeout(action, this._time);
    }
    
    cancelNext(){
        if(this._timeoutID) clearTimeout(this._timeoutID);
    }
}

type MonacoViewportProps = {
    value: string,
    onChange: (value: string)=>void,
    language: string,
    isFullScreenMode: bool
};

type MonacoViewportState = {
    
};

class MonacoViewport extends React.Component<MonacoViewportProps,MonacoViewportState> {

   
    _monacoContainer: ?HTMLElement;
    _onDocumentResizeListener: ()=> void;
    _editor: any;
    _relayoutDebounce: Debounce;

    constructor(props: MonacoViewportProps){
        super(props);
        this._relayoutDebounce = new Debounce(200);
        this.state ={scrollTop: 0};
    }

    refreshEditorLayout(){
        if(this._editor){
            let scrollTop = this._editor.getScrollTop();
            let position = this._editor.getPosition();
            let selection = this._editor.getSelection();
            this._editor.domElement.style.display='block';
            this._editor.layout(true);
            this._editor.layout(false);
            this._editor.setScrollTop(scrollTop);
            this._editor.setPosition(position);
             this._editor.setSelection(selection);
        }
    }

    componentWillUnmount(){
        if(this._onDocumentResizeListener)
            window.removeEventListener('onresize', this._onDocumentResizeListener);
    }

    componentDidUpdate(prevProps: MonacoViewportProps, prevState: {}, snapshot: any){
        this.refreshEditorLayout();        
    }

    shouldComponentUpdate(nextProps: MonacoViewportProps, nextState: {}){
        if(this.props.isFullScreenMode!==nextProps.isFullScreenMode){
            setTimeout(()=>{
                this.refreshEditorLayout();
                if(this._editor){
                    this._editor.focus();
                }
            },10);
        }
        return false;
    }

    componentDidMount(){
        if(this._monacoContainer!=null){

            /*
                MONACO EDITOR OPTIONS
                https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
                https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors
            */

            var editor = monaco.editor.create(this._monacoContainer, {
                theme: 'hokus',
                value: this.props.value,
                minimap: {enabled: false},
                wordWrap: 'on', //off or min
                language: this.props.language,
                fontFamily: 'Roboto',
                fontSize: 16,
                snippetSuggestions: false,
                quickSuggestions: false
            });

            // editor.onDidChangeCursorPosition(()=>{
            //     this.cachePosition();
            // });

            // editor.onDidScrollChange(()=>{
            //     this.setState({ scrollTop: editor.getScrollTop() });
            // });

            editor.onDidChangeModelContent((event: any) => {
                const value = editor.getValue();
                this.props.onChange(value);
            });

            this._onDocumentResizeListener = ()=>{
                editor.domElement.style.display='none';
                this._relayoutDebounce.run(()=>{
                    this.refreshEditorLayout();
                });
            };

            //editor.setScrollTop(this.state.scrollTop);
            window.addEventListener('resize', this._onDocumentResizeListener);

            // let positionData = this.getPositionFromCache();
            // if(positionData){
            //     editor.setPosition(positionData.position);
            //     editor.setScrollTop(positionData.scrollTop);
            //     if(this.isFullScreen()){
            //         //editor.focus();
            //     }       
            // }

            this._editor = editor;
        }
    }

    render(){
        return (
            <div style={{height:'100%'}} ref={(ref)=>{ this._monacoContainer = ref }}></div>
        )
    }
}

class MonacoDynamic extends BaseDynamic<MarkdownDynamicField,MarkdownDynamicState> {
    
    _updateDebounce: Debounce;

    constructor(props: ComponentProps<MarkdownDynamicField>){
        super(props);
        let value = this.props ? this.props.context.value : '';
        let preview = md.render(value);
        this.state = {
            value,
            preview
        }

        this._updateDebounce = new Debounce(200);
    }

    normalizeState({state, field}: { state: any, field: MarkdownDynamicField, stateBuilder: any }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'monaco-editor';
    }

    buildBreadcumbFragment(node : any, buttons : Array<{label:string, node:any}>){
        buttons.push({label: node.field.title, node});
    }

    shouldComponentUpdate(nextProps: ComponentProps<MarkdownDynamicField>, nextState: MarkdownDynamicState){
        let currentPathChanged = this.props.context.currentPath != nextProps.context.currentPath
        let previewChanged = this.state.preview !== nextState.preview;
        let valueChanged = this.props.context.value !== nextProps.context.value;
        return ( currentPathChanged || previewChanged || valueChanged );
    }

    onChange(value: string){
        this.props.context.setValue(value);
        this._updateDebounce.run(()=>{
            this.setState({preview: md.render(value)});
        });
    }

    // cachePosition(){
    //     if(this._editor){
    //         let cache = this.props.context.form.cache;
    //         cache['monaco-editor-'+this.props.context.nodePath] = { position: this._editor.getPosition(), scrollTop: this._editor.getScrollTop() };
    //     }
    // }

    // getPositionFromCache(){
    //     let data = this.props.context.form.cache['monaco-editor-'+this.props.context.nodePath];
    //     return data;
    // }

    isFullScreen(){
        let context = this.props.context;
        return context.nodePath === context.currentPath;
    }

    exitFullScreen(){
        this.props.context.backOnePath();
    }

    goFullScreen(){
        this.props.context.setPath(this.props.context.node);
    }

    shouldRenderEditor(targetProps: ComponentProps<MarkdownDynamicField>){
        return targetProps.context.nodePath.startsWith(this.props.context.currentPath);
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath, nodePath} = context;
        let {field} = node;
        
        if(!this.shouldRenderEditor(this.props)){
            return (null);
        }

        let isFullScreen = this.isFullScreen();
        let height = isFullScreen ? 'calc(100vh - 140px)':'300px';
        let MaximixeIcon = isFullScreen ? IconFullscreenExit : IconFullscreen;
        
        let centerColItems = [];

        if(field.tip){
            centerColItems.push(<Tip key="tip" horizontalAlign='right' markdown={field.tip} style={{position:'absolute', right:0, top:20, zIndex:2}} />);
        }

        centerColItems.push(<IconButton
            key="goFullScreen"
            iconStyle={{ width: 18, height: 18 }}
            onClick={ ()=>{
                isFullScreen? this.exitFullScreen() : this.goFullScreen();
            } }
        ><MaximixeIcon /></IconButton>);

        return (
        <DefaultWrapper style={{display:'flex', justifyContent: 'space-between'}}>
            <div style={{ flex:1, marginRight: '7px', position:'relative' }}>
                <div style={{ height: height, background:editorBackground, position:'relative', padding:'20px 0', borderRadius:'10px'}}>
                    <MonacoViewport
                        value={this.props.context.value}
                        onChange={this.onChange.bind(this)}
                        language={this.props.context.node.field.language||'markdown'}
                        isFullScreenMode={this.isFullScreen()}
                        />
                </div>
            </div>
            { centerColItems.length ? <div style={{ flex:'0 0 20px'}}>
                { centerColItems }
            </div> : undefined }
            <div style={{ height: height, flex: 1, marginLeft: '7px', position: 'relative' }} >
                <Paper zDepth={1} rounded={false} style={{ height:'100%', overflow:'auto' }}>
                    <div className="markdown"
                        style={{ padding:20, paddingBottom:height, boxSizing:'content-box', position: 'relative' }} dangerouslySetInnerHTML={{__html:this.state.preview}}>
                    </div>
                </Paper>
            </div>
        </DefaultWrapper>
        );
    }
}

export default MonacoDynamic;