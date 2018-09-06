//@flow

import { ComponentRegistry } from './component-registry';

export class FormStateBuilder{

    rootState: any;
    componentRegistry : ComponentRegistry;

    constructor(componentRegistry: ComponentRegistry){
        this.componentRegistry = componentRegistry;
    }

    makeRootState(fields: Array<any>, refState: any){
        this.rootState = refState;
        this.setLevelState(refState, fields);
    }

    reportDataReplacement(field: any, oldData: any, newData: any){
        console.log('Data replaced for field '+field.key);
    }

    setLevelState(state: any, fields: any){
        for(let i = 0; i < fields.length; i++){
            let field = fields[i];

            let component = this.componentRegistry.getProplessInstance(field.type);
            if(component){
                state = component.allocateStateLevel(field,state,this.rootState);
                component.normalizeState({
                    state,
                    field,
                    stateBuilder:this
                });               
            }
            else{
                throw new Error('Could not find component of type '+field.type);
            }
        }
    }
}