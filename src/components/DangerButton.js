import React from 'react';

class DangerButton extends React.Component{
    constructor(props){
        super(props);
        this.state = { clicked:false }
        this.timeout = 0;
    }    

    clearTimeout(){
        if(this.timeout)
            clearTimeout(this.timeout);
    }

    componentWillUnmount(){
        this.clearTimeout();
    }

    onButtonClick(e){
        
        if(this.props.onClick)
                this.props.onClick(e, this.state.clicked);

        if(this.state.clicked){
            this.setState({ clicked:false });
            this.clearTimeout();
        }
        else{
            this.setState({ clicked:true });

            this.timeout = setTimeout(function(){
                this.setState({ clicked:false });
            }.bind(this), 3000);
        }
    }

    render(){
        if(this.props.loadedButton){
            if(!this.state.clicked){
                return React.cloneElement(this.props.button, { onClick: this.onButtonClick.bind(this) });
            }
            else{
                return React.cloneElement(this.props.loadedButton, { onClick: this.onButtonClick.bind(this) });
            }
        }
        else{
            let _props = Object.assign(this.state.clicked ? this.props.loadedProps : { onClick: this.onButtonClick.bind(this) });
            return React.cloneElement(this.props.button, _props);
        }
        
    }
}

export default DangerButton;