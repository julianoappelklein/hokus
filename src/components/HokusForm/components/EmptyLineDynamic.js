//@flow

import React from 'react';
import { BaseDynamic } from '../../HoForm';

type EmptyLineDynamicField = {
    key: string,
    compositeKey: string,
    type: string,
    amount: ?number
}

type EmptyLineDynamicState = {
    
}

class EmptyLineDynamic extends BaseDynamic<EmptyLineDynamicField, EmptyLineDynamicState> {

    getType(){
        return 'empty-line';
    }

    renderComponent(){
        
        let {context} = this.props;
        let {node, currentPath, parentPath} = context;
        let {field} = node;

        if(currentPath!==parentPath){ return (null); }

        return (<div>
            { new Array(field.amount||1).map((d,i)=><br key={i} />) }
        </div>);
    }
}

export default EmptyLineDynamic;