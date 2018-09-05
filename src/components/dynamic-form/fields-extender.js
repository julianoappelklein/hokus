import componentRegistry from './component-registry';

class DynamicFormFieldsExtender{

    extendFields(fields){
        for(let i = 0; i < fields.length; i++){
            let field = fields[i];
            let component = componentRegistry.getProplessInstance(field.type);
            component.extendField(field, this);
        }
    }
}

const fieldsExtender = new DynamicFormFieldsExtender();

export default fieldsExtender;