import { ComponentRegistry } from "./component-registry";
import { FormIncludes } from "./types";

export class FieldsExtender {
  componentRegistry: ComponentRegistry;
  formIncludes: FormIncludes;

  constructor(componentRegistry: ComponentRegistry, formIncludes: FormIncludes) {
    this.componentRegistry = componentRegistry;
    this.formIncludes = formIncludes;
  }

  extendFields(fields: Array<any>) {
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let component = this.componentRegistry.getProplessInstance(field.type);
      component.extendField({ field, extender: this, includes: this.formIncludes });
    }
  }
}
