import React from 'react';

class Spinner extends React.Component {

    constructor(props){
        super(props);
        this.state = {rotated:false};
    }

    spin(){
        let {time=3000} = this.props;
        this.timeout = setTimeout(()=>{
            
            this.setState({rotated:!this.state.rotated});

            this.timeout = setTimeout(() => {
                this.spin();
            }, time)

        },300);
    }

    componentDidMount(){
        this.spin();
    }

    componentWillUnmount(){
        if(this.timeout) clearTimeout(this.timeout);
    }

    render(){
        let {time=3000,spins=3, color='rgba(0, 0, 0, 0.2)', margin=undefined, size=48} = this.props;
        let borderWidth = Math.max(1, parseInt(size/10,10));
        let borderStyle = `${borderWidth}em solid ${color}`
        let style = {
            margin: margin||'40em',
            fontSize: '1px',
            position: 'relative',
            borderTop: borderStyle,
            borderRight: borderStyle,
            borderBottom: borderStyle,
            borderLeft: `${borderWidth}em solid transparent`,
            borderRadius: '50%',
            width: size||'80em',
            height: size||'80em',
            transition: 'transform ease-in-out '+time+'ms',
            transform: 'rotate('+ (this.state.rotated?360*spins:0) +'deg)'
         };
        return <div>
            <div style={style}></div>
        </div>;
    }
}

export default Spinner;