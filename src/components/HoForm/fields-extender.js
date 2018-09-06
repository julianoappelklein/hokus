//@flow

import { ComponentRegistry } from './component-registry';

export class FieldsExtender{

    componentRegistry: ComponentRegistry;
    currentKey: string;

    constructor(componentRegistry: ComponentRegistry){
        this.componentRegistry = componentRegistry;
        this.currentKey = 'root';
    }

    extendFields(fields: Array<any>){
        let key = this.currentKey;
        for(let i = 0; i < fields.length; i++){
            let field = fields[i];
            this.currentKey = key + '.' + field.key;
            field.compositeKey = this.currentKey;
            let component = this.componentRegistry.getProplessInstance(field.type);
            component.extendField(field, this);
        }
        //console.log(fields);
    }
}