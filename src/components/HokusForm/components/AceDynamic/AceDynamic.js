//@flow

import React from 'react';
import Tip from '../../../Tip';
import DefaultWrapper from '../shared/DefaultWrapper';
import IconButton from 'material-ui/IconButton';
import IconFullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import IconFullscreenExit from 'material-ui/svg-icons/navigation/fullscreen-exit';
import Paper from 'material-ui/Paper';
import MarkdownIt from 'markdown-it';
import { AceEditor } from './AceEditor'

import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase } from '../../../HoForm';
import { BaseDynamic } from '../../../HoForm';


const md = new MarkdownIt({html:true});

type AceDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    default: ?string,
    tip: ?string,
    multiLine: ?bool,
    language: ?string,
    lightTheme: bool
}

type AceDynamicState = {
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


class AceDynamic extends BaseDynamic<AceDynamicField,AceDynamicState> {
    
    _updateDebounce: Debounce;

    constructor(props: ComponentProps<AceDynamicField>){
        super(props);
        let value = this.props ? this.props.context.value : '';
        let preview = md.render(value||'');
        this.state = {
            value,
            preview
        }

        this._updateDebounce = new Debounce(200);
    }

    normalizeState({state, field}: { state: any, field: AceDynamicField, stateBuilder: any }){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'code-editor';
    }

    buildBreadcumbFragment(node : any, buttons : Array<{label:string, node:any}>){
        buttons.push({label: node.field.title, node});
    }

    onChange(value: string){
        this.props.context.setValue(value);
        this._updateDebounce.run(()=>{
            this.setState({preview: md.render(value||'')});
        });
    }

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

    handleStateSnapshotEmit(editorState: any){
        this.props.context.getCache().editorState = editorState;
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath, nodePath} = context;
        let {field} = node;
        
        if(!nodePath.startsWith(currentPath)){
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
        
        let lightTheme = field.lightTheme===true;

        return (
        <DefaultWrapper style={{display:'flex', justifyContent: 'space-between'}}>
            <div style={{ flex:1, marginRight: '7px', position:'relative' }}>
                <div style={{ height: height, background:lightTheme?'#eeeeee':'#15101d', position:'relative', padding:'20px 0', paddingRight:lightTheme?'1px':undefined, borderRadius:'10px'}}>
                    <AceEditor
                        value={this.props.context.value}
                        editorState={this.props.context.getCache().editorState}
                        onChange={this.onChange.bind(this)}
                        isFullScreenMode={this.isFullScreen()}
                        language={field.language||'markdown'}
                        lightTheme={lightTheme}
                        onStateSnapshotEmit={this.handleStateSnapshotEmit.bind(this)}
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

export default AceDynamic;