import React from 'react';
import Border from './../Border';
import BaseDynamic from './BaseDynamic';
import Spinner from './../Spinner';
import IconBroken from 'material-ui/svg-icons/image/broken-image';

class BundleImgThumbDynamic extends BaseDynamic {

    constructor(props){
        super(props);
        if(props){
            this.state = { src: undefined };
        }
    }

    renderComponent(){
        let {node, form} = this.props.context;
        let {field, state} = node;
        return (
        <div style={{ width:'64px', height:'64px', marginBottom:'16px', overflow:'hidden', background:'#16062f' }}>
            {
                this.state.src === undefined ? (<Spinner size={32} margin={16} color={ 'RGBA(255,255,255,.3)' } />)
                : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
                : (<img src={this.state.src} className="fadeIn animated" style={{width:'64xp', height:'64px'}} /> )
            }
        </div>);
    }

    componentDidMount(){
        let {node, form} = this.props.context;
        let {field, state} = node;
        form.props.plugins.getBundleThumbnailSrc(state[field.src||'src'])
        .then((src)=>{
            this.setState({src});
        });
    }

    getType(){
        return 'bundle-image-thumbnail';
    }
}

export default BundleImgThumbDynamic;