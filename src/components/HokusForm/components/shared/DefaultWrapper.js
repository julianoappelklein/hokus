//@flow

import React from 'react';

class DefaultWrapper extends React.Component<{children: any, style?: any},{}>{
    render() {
        return <div
            style={Object.assign({position : 'relative', paddingBottom: '16px', width:'100%'}, this.props.style)}>
            {this.props.children}
        </div>;
    }
}

export default DefaultWrapper;