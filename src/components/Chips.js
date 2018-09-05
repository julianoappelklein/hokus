import React from 'react';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';

const Fragment = React.Fragment;

class Chips extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value:'',
            dragFromIndex:undefined,
            dragToIndex:undefined,
        };
    }

    onChangeHandler(e, newVal){
        this.setState(Object.assign({}, this.state, {value:newVal}));
    }

    onKeyPressHandler(e){
        if(e.key==='Enter'){
            e.preventDefault();
            if(this.props.onPushItem)
                this.props.onPushItem(this.state.value);
            this.setState({value:''});
        }
    }

    componentWillUnmount(){
        document.removeEventListener('mouseup', this.documentMouseUpListener);
    }

    getOnRequestDelete(index){
        return function(e){
            e.stopPropagation();
            if(this.props.onRequestDelete){
                this.props.onRequestDelete(index);
            }
        }.bind(this);
    }

    //DRAG EVENTS
    getDocumentMouseUpListener(){
        this.documentMouseUpListener = function(e){
            if(this.props.onSwap){
                this.props.onSwap(e, {index:this.state.dragFromIndex, otherIndex:this.state.dragToIndex});
            }
            this.setState(Object.assign({}, this.state, { dragFromIndex: undefined, dragToIndex:undefined }));
            document.removeEventListener('mouseup', this.documentMouseUpListener);
        }.bind(this)
        return this.documentMouseUpListener;
    }

    getOnItemMouseDown(index){
        return function(e){
            if(this.props.sortable){
                e.stopPropagation();
                e.preventDefault();    
                this.setState(Object.assign({}, this.state, { dragFromIndex: index, dragToIndex: index }));
                document.addEventListener('mouseup', this.getDocumentMouseUpListener());
            }
        }.bind(this)
    }

    getOnItemMouseEnter(index){
        return function(e){
            if(this.state.dragFromIndex!==undefined){
                this.setState(Object.assign({}, this.state, {dragToIndex: index}));
            }
        }.bind(this)
    }

    renderChip(index, label, opacity){
        return <Chip
            key={'chip-'+index}
            style={{opacity:opacity, margin:'2px'}}
            onRequestDelete={ this.getOnRequestDelete(index) }
            onMouseDown={this.getOnItemMouseDown(index)}
            onMouseEnter={this.getOnItemMouseEnter(index)}
            >
            {label}
        </Chip>;
    }

    renderDecoyChip(index,label, opacity){
        return <Chip
            key={'decoy-chip-'+index}
            style={{opacity:opacity, margin:'2px'}}
            onRequestDelete={function(){}}>
            {label}
        </Chip>;
    }

    render(){

        let { dragToIndex, dragFromIndex } = this.state;

        return (
        <Fragment>
            <TextField
                floatingLabelFixed={true}
                multiLine={false}
                value={this.state.value}
                onChange = {this.onChangeHandler.bind(this)}
                underlineShow={this.props.underlineShow}
                fullWidth={this.props.fullWidth}
                floatingLabelText={this.props.field.title}
                onKeyPress={ this.onKeyPressHandler.bind(this) }
            />
            <div style={{display: 'flex',flexWrap: 'wrap'}}>
            {this.props.items.map((item, index)=>{

                if(index===dragFromIndex){
                    return this.renderChip(index,item, dragFromIndex!==dragToIndex?.15:1);
                }
                
                if(index===dragToIndex){
                    let movedChip = this.renderDecoyChip(index, this.props.items[dragFromIndex], 1);
                    let beforeChip, afterChip;
                    if(dragFromIndex < dragToIndex)
                        afterChip = movedChip;
                    else
                        beforeChip = movedChip;
                    return <Fragment key={'chip'+index}>
                        {beforeChip}
                        {this.renderChip(index,item)}
                        {afterChip}
                    </Fragment>
                }
                else{
                    return this.renderChip(index, item);
                }
            })}
            </div>
        </Fragment>);
    }
}

export default Chips;