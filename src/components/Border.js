import React from 'react';

class Border extends React.Component {
    render(){
        
        return (<div style={ Object.assign({ border: 'solid 1px #e8e8e8', borderRadius:'7px'}, this.props.style)}>
            {this.props.children}
        </div>);
    }
}

export default Border;