//@flow

import * as React from 'react';

type UpdatableProps = {
    children: any,
    update: bool
}

type UpdatableState = {
    
}

export class Updatable extends React.Component<UpdatableProps, UpdatableState>{
    
    shouldComponentUpdate(nextProps: UpdatableProps, nextState: UpdatableState){
        return nextProps.update;
    }

    render(){
        return this.props.children;
    }
}
