import * as React from "react";
import { ComponentContext } from "./component-context";
import { HoForm } from "./HoForm";
import { FormStateBuilder } from "./form-state-builder";
import { FieldsExtender } from "./fields-extender";

export interface FieldBase {
  key: string;
  type: string;
  field?: FieldBase & { [key: string]: any };
  default?: any;
  fields?: Array<FieldBase & { [key: string]: any }>;
}

export type FormIncludes = {
  [name: string]: Array<any>;
};

export interface CrawlContext<Field extends FieldBase> {
  form: HoForm;
  node: DynamicFormNode<Field>;
}

export interface NormalizeStateContext<Field extends FieldBase> {
  state: any;
  field: Field;
  stateBuilder: FormStateBuilder;
  includes: FormIncludes;
}

export interface ExtendFieldContext<Field extends FieldBase> {
  extender: FieldsExtender;
  field: Field;
  includes: FormIncludes;
}

// export interface FieldBaseGroup extends FieldBase {
//     fields: Array<FieldBase>;
// };

export interface DynamicFormNode<Field extends FieldBase> {
  field: Field;
  state: any;
  parent: DynamicFormNode<FieldBase> | null;
}

export interface ComponentProps<Field extends FieldBase> {
  context: ComponentContext<Field>;
}

export type BreadcumbNode = {
  label: string;
  node: DynamicFormNode<FieldBase> | null;
};

export type BreadcumbProps = {
  items: Array<BreadcumbNode>;
  onNodeSelected: (node: DynamicFormNode<FieldBase>) => void;
};

export type BreadcumbComponentType = React.ComponentType<BreadcumbProps>;

export { ComponentContext } from "./component-context";
