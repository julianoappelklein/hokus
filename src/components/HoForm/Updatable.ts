import * as React from 'react';

type UpdatableProps = {
    children: any,
    update: boolean
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
