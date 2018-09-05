import dynamicFormComponents from './all';

class ComponentRegistry{

    constructor(){
        
        this.dynamicComponents = {};
    }

    register(classType){
        let proplessInstance = new classType();
        this.dynamicComponents[proplessInstance.getType()] = {
            classType,
            proplessInstance
        };
    }

    getProplessInstance(typeName){
        return this.dynamicComponents[typeName].proplessInstance;
    }

    getClassType(typeName){
        return this.dynamicComponents[typeName].classType;
    }
}

let componentRegistry = new ComponentRegistry();

for(var key in dynamicFormComponents){
    let classType = dynamicFormComponents[key];
    componentRegistry.register(classType);
}

export default componentRegistry;