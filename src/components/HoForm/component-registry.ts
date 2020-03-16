import * as React from 'react';
import {ComponentProps, FieldBase} from './types';
import BaseDynamic from './BaseDynamic';

export class ComponentRegistry {

    dynamicComponents: {
        [key: string] : {
            classType: any,
            proplessInstance: BaseDynamic<FieldBase, any>
        }
    };

    constructor(componentTypes: Array<React.ComponentType<ComponentProps<FieldBase>>>){
        this.dynamicComponents = {};
        for(let i = 0; i < componentTypes.length; i++){
            this.register(componentTypes[i]);
        }
    }

    register(classType: React.ComponentType<ComponentProps<FieldBase>>){
        //$FlowFixMe
        let proplessInstance = new (classType as any)();
        //$FlowFixMe
        this.dynamicComponents[proplessInstance.getType()] = {
            classType,
            proplessInstance
        };
    }

    getProplessInstance(typeName: string){
        let c = this.dynamicComponents[typeName];
        if(c==null)
            throw new Error(`Could not find component for type '${typeName}'.`);
        return c.proplessInstance;
    }

    getClassType(typeName: string){
        let c = this.dynamicComponents[typeName];
        if(c==null)
            throw new Error(`Could not find component for type '${typeName}'.`);
        return c.classType;
    }

    get(typeName: string){
        let c = this.dynamicComponents[typeName];
        if(c==null)
            throw new Error(`Could not find component for type '${typeName}'.`);
        return c;
    }
}