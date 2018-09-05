import React from 'react';

class DefaultWrapper extends React.Component{
    render() {
        return <div
            datatype={this.props.datatype}
            style={Object.assign({position : 'relative', paddingBottom: '16px', width:'100%'}, this.props.style)}>
            {this.props.children}
        </div>;
    }
}

export default DefaultWrapper;