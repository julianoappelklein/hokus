import React from "react";
import { ComponentProps, FieldBase } from "./types";
import BaseDynamic from "./BaseDynamic";

export class ComponentRegistry {
  dynamicComponents: {
    [key: string]: {
      classType: React.ComponentClass<ComponentProps<FieldBase>>;
      // TODO: is this strong enough?
      proplessInstance: BaseDynamic<any, any>;
    };
  };

  constructor(componentTypes: Array<React.ComponentClass<ComponentProps<FieldBase>>>) {
    this.dynamicComponents = {};
    for (let i = 0; i < componentTypes.length; i++) {
      this.register(componentTypes[i]);
    }
  }

  // TODO: come up with a better type
  register(classType: any) {
    const proplessInstance: BaseDynamic<any, any> = new classType();
    this.dynamicComponents[proplessInstance.getType()] = {
      classType,
      proplessInstance
    };
  }

  getProplessInstance(typeName: string) {
    let c = this.dynamicComponents[typeName];
    if (c == null) {
      throw new Error(`Could not find component for type '${typeName}'.`);
    }
    return c.proplessInstance;
  }

  getClassType(typeName: string) {
    let c = this.dynamicComponents[typeName];
    if (c == null) throw new Error(`Could not find component for type '${typeName}'.`);
    return c.classType;
  }

  get(typeName: string) {
    let c = this.dynamicComponents[typeName];
    if (c == null) throw new Error(`Could not find component for type '${typeName}'.`);
    return c;
  }
}
