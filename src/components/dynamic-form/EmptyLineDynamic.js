import React from 'react';
import BaseDynamic from './BaseDynamic';


class EmptyLineDynamic extends BaseDynamic {

    normalizeState({state, field}){
        
    }

    getType(){
        return 'empty-line';
    }

    shouldComponentUpdate(nextProps, nextState){
        return (this.props.context.currentPath !== nextProps.context.currentPath);
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