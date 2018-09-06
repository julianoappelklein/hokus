//@flow

import React from 'react';
import Tip from '../../Tip';
import DefaultWrapper from './shared/DefaultWrapper';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import MarkdownIt from 'markdown-it'
import { BaseDynamic } from '../../HoForm';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase } from '../../HoForm';
const md = new MarkdownIt({html:true});
const imgIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 129 129" enable-background="new 0 0 129 129" width="32px" height="32px"><g><g><circle cx="76" cy="42.4" r="6.6" fill="#933EC5"/><path d="m6.4,119.5c0,0 0,0.1 0,0 0,0.1 0,0.1 0.1,0.1 0.1,0.2 0.2,0.5 0.3,0.7 0,0.1 0.1,0.1 0.1,0.2 0,0.1 0.1,0.1 0.1,0.2 0,0 0.1,0.1 0.1,0.1 0.1,0.2 0.3,0.3 0.4,0.5 0,0 0.1,0.1 0.1,0.1 0.1,0.1 0.1,0.1 0.2,0.2 0.1,0 0.1,0.1 0.1,0.1 0.1,0.1 0.2,0.1 0.3,0.2 0,0 0.1,0.1 0.1,0.1 0,0 0.1,0 0.1,0.1 0.1,0.1 0.3,0.1 0.4,0.2 0.1,0 0.1,0 0.2,0.1 0.1,0 0.2,0.1 0.2,0.1 0.3,0.1 0.6,0.1 0.9,0.1h108.2c2.3,0 4.1-1.8 4.1-4.1v-27-80.9c0-2.3-1.8-4.1-4.1-4.1h-107.9c-2.3,0-4.1,1.8-4.1,4.1v80.7 27c0,0.3 0.1,0.7 0.1,1 0,0.1 0,0.2 0,0.2zm108.1-5.2h-90.4l66.8-43.7 23.6,22.5v21.2zm-100-99.6h100v67.1l-20.3-19.4c-1.4-1.3-3.5-1.5-5.1-0.5l-19.1,12.6-13.3-13.4c-1.4-1.4-3.5-1.6-5.1-0.6l-37.1,23.4v-69.2zm0,78.9l38.7-24.4 9.8,9.9-48.5,31.7v-17.2z" fill="#933EC5"/></g></g></svg>'
//const cogIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 508.551 508.551" style="enable-background:new 0 0 508.551 508.551;" xml:space="preserve" width="32px" height="32px"><g><path d="M506.946,282.228c0.953-9.153,1.589-18.497,1.589-27.969c0-9.471-0.636-18.815-1.621-28      l-69.477-24.727c-4.036-13.921-9.535-27.174-16.432-39.601l31.592-66.457c-11.728-14.62-25.013-27.905-39.633-39.633      l-66.553,31.592c-12.363-6.865-25.648-12.332-39.506-16.336L282.244,1.621C273.091,0.604,263.747,0,254.276,0      s-18.815,0.604-28,1.621l-24.727,69.477c-13.921,4.005-27.206,9.471-39.569,16.336L95.49,55.842      C80.871,67.57,67.585,80.855,55.858,95.475l31.592,66.457c-6.865,12.395-12.332,25.68-16.336,39.601L1.605,226.259      c-0.985,9.185-1.589,18.529-1.589,28c0,9.471,0.604,18.815,1.621,28l69.508,24.727c4.005,13.921,9.439,27.142,16.336,39.569      l-31.592,66.489c11.728,14.62,25.013,27.937,39.633,39.633l66.457-31.592c12.395,6.865,25.68,12.332,39.601,16.368      l24.727,69.508c9.153,0.953,18.497,1.589,27.969,1.589s18.815-0.636,28-1.621l24.727-69.54      c13.921-4.005,27.142-9.439,39.569-16.336l66.489,31.592c14.62-11.728,27.937-25.013,39.633-39.633l-31.592-66.489      c6.865-12.459,12.332-25.744,16.368-39.569L506.946,282.228z M254.276,381.39c-70.208,0-127.13-56.922-127.13-127.13      s56.922-127.13,127.13-127.13s127.13,56.922,127.13,127.13S324.483,381.39,254.276,381.39z" fill="#933EC5"/><circle cx="254.276" cy="254.26" r="63.565" fill="#933EC5"/></g></svg>';

function debounce(fn, delay) {
    var timer: ?TimeoutID = null;
    return function () {
        let context = this;
        let args = arguments;
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

const imgMatcher = /<img.+?>/gi;
const shortcodeMatcher = /({{<.+?>}}|{{%.+?%}})/gi;
const linkHrefMatcher = /<a.+?>/gi;

type MarkdownDynamicField = {
    type: string,
    key: string,
    compositeKey: string,
    multiLine: ?bool,
    default: ?string,
    tip: ?string,
    title: string
}

type MarkdownDynamicState = {
    value: string,
    preview: string,
    maxHeight: ?number
}

class MarkdownDynamic extends BaseDynamic<MarkdownDynamicField, MarkdownDynamicState> {

    previewContainer: ?HTMLElement;
    markdownWrapper: ?HTMLElement;
    inputWrapper: ?HTMLElement;
    updatePreviewStateDebounced: ()=>void;

    constructor(props: ComponentProps<MarkdownDynamicField>){
        super(props);
        let val = this.props ? this.props.context.value : '';
        let preview = md.render(val||'');
        preview = this.applyTransformation(preview);
        this.state = {
            value:val,
            preview,
            maxHeight: null
        };
           
        this.updatePreviewStateDebounced = debounce(this.updatePreviewState.bind(this),250);
    }
    
    applyTransformation(preview: string){
        preview = preview.replace(imgMatcher,imgIcon);
        preview = preview.replace(shortcodeMatcher,'<span style="color: #933ec5!important">$1</span>');
        preview = preview.replace(linkHrefMatcher,'<a color="#933ec5!important" click="function(){ return false }" href="#">');
        return preview;
    }

    updatePreviewState(){
        let preview = md.render(this.state.value||'');
        //highlight shortcodes
        //replace images
        
        preview = this.applyTransformation(preview);

        // while(reg.exec(preview)){
            
        // }
        this.setState({ preview: preview });
        this.props.context.setValue(this.state.value, 250);
        this.fixHeight();
    }

    normalizeState({state, field}:{state: any, field: MarkdownDynamicField }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'markdown';
    }

    componentDidMount(){
        setTimeout(()=>{
            this.fixHeight();
        });
    }

    shouldComponentUpdate(nextProps: ComponentProps<MarkdownDynamicField>, nextState: MarkdownDynamicState){
        return (
            this.props.context.value !== nextProps.context.value
            || this.props.context.currentPath !== nextProps.context.currentPath
            || this.state.preview !== nextState.preview
            || this.state.value !== nextState.value
            || this.state.maxHeight !== nextState.maxHeight
        );
    }

    onChange(e: any, value: string){
        this.setState({value});
        this.updatePreviewStateDebounced();
    }

    fixHeight(){
        if(this.inputWrapper){
            let textArea = this.inputWrapper.querySelector('textarea[id]');
            if(textArea){
                let maxHeight = textArea.clientHeight + 48;
                this.setState({maxHeight});
            }
        }
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath} = context;
        let {field} = node;
        
        if(currentPath!==context.parentPath){
            return (null);
        }
        
        let tip = undefined;
        let paddingRight = 0;
        if(field.tip){
            tip = <Tip horizontalAlign='left' markdown={field.tip} style={{position:'absolute', right:0, top:20, zIndex:2}} />;
            paddingRight = 50;
        }
        let multiLine = field.multiLine===undefined?true:field.multiLine;
        

        return (
        <DefaultWrapper style={{display:'flex', justifyContent: 'space-between'}}>
            <div
                ref={(div) => { this.inputWrapper = div; }}
                style={{ flex:1, marginRight: '7px' }}
            >            
                <TextField
                    onChange={this.onChange.bind(this)}
                    value={this.state.value}
                    floatingLabelFixed={true}
                    multiLine={multiLine}
                    fullWidth={true}
                    rowsMax={30}
                    underlineShow={true}
                    textareaStyle={{minHeight: '80px'}}
                    style={{paddingRight, transition:'none', boxSizing:'border-box'}}
                    floatingLabelText={field.title} />
            </div>
            {tip}
            <div
                ref={(div) => { this.markdownWrapper = div; }}
                style={{flex:1, marginLeft: '7px', position:'relative', height:this.state.maxHeight, transition:'all .25s ease-in-out',}}
            >
                <Paper zDepth={1} rounded={false} style={{height:'100%', overflow:'auto'}}>
                    <div className="markdown"
                        style={{
                            padding:20,
                            paddingBottom: Math.max(20, this.state.maxHeight?this.state.maxHeight*2/3:0) }}
                            ref={(div) => { this.previewContainer = div; }}
                            dangerouslySetInnerHTML={{__html:this.state.preview}}>
                    </div>
                </Paper>
            </div>
        </DefaultWrapper>
        );
    }
}

export default MarkdownDynamic;