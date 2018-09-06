//@flow

import { BaseDynamic } from '../../HoForm';
import type { ComponentContext, DynamicFormNode, ComponentProps, FieldBase } from '../../HoForm';

type HiddenDynamicField = {
    type: string,
    key: string,
    compositeKey: string,
    default: ?string
}

type HiddenDynamicState = {
}

class HiddenDynamic extends BaseDynamic<HiddenDynamicField, HiddenDynamicState> {

    normalizeState({state, field}: {state: any, field: HiddenDynamicField}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'hidden';
    }

    renderComponent(){
        return null;
    }
}

export default HiddenDynamic;