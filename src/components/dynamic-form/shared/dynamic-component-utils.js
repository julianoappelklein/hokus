export default {
    normalizeStateForGroupedObject: (state, field, stateBuilder)=>{
        let key = field.key;
        if(state[key]===undefined){
            state[key] = {};
        }
        if(typeof state[key] !== 'object' && state[key] !== null){
            let newData = {};
            stateBuilder.reportDataReplacement(field, state[key], newData);
            state[key] = newData;
        }
        stateBuilder.setLevelState(state[key], field.fields);
    },
    normalizeStateForArrayOfObject: (state, field, stateBuilder)=>{
        let key = field.key;
        if(state[key]===undefined){
            state[key] = field.default || [];
        }
        else if(!Array.isArray(state[key])){
            let newData = field.default || [];
            stateBuilder.reportDataReplacement(field, state[key], newData);
            state[key] = newData;
        }
        for(let j = 0; j < state[key].length; j++){
            stateBuilder.setLevelState(state[key][j], field.fields);
        }
    }
}