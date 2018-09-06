//@flow

import * as React from 'react';

type DangerButtonProps = {
    button: React.Element<*>,
    loadedButton?: React.Element<*>,
    loadedProps?: Object,
    onClick: (event: Event, warn: bool)=>void
}

type DangerButtonState = {
    clicked: bool
}

class DangerButton extends React.Component<DangerButtonProps,DangerButtonState>{
    
    timeout: any;

    constructor(props: DangerButtonProps){
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

    onButtonClick(e: Event){
        
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
            return React.cloneElement(
                (this.state.clicked ? this.props.loadedButton : this.props.button),
                { onClick: this.onButtonClick.bind(this) }
            );            
        }
        else{
            let _props = Object.assign(
                {},
                (this.state.clicked ? this.props.loadedProps : undefined ),
                { onClick: this.onButtonClick.bind(this) }
            );
            return React.cloneElement(this.props.button, _props);
        }
        
    }
}

export default DangerButton;