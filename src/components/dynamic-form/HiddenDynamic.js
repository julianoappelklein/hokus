import BaseDynamic from './BaseDynamic';

class HiddenDynamic extends BaseDynamic {

    normalizeState({state, field}){
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || '';
        }
    }

    getType(){
        return 'hidden';
    }

    shouldComponentUpdate(nextProps, nextState){
        return false;
    }

    renderComponent(){
        return null;
    }
}

export default HiddenDynamic;