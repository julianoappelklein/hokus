import { FieldBase, DynamicFormNode } from "./types";
import { HoForm } from "./HoForm";
export class ComponentContext<Field extends FieldBase> {
  node: DynamicFormNode<Field>;
  currentNode: DynamicFormNode<Field>;

  nodePath: string;
  parentPath: string;
  currentPath: string;
  proplessInstance: any;

  onValueChanged: ((value: any) => void) | null;

  form: HoForm;
  value: any;

  constructor(
    form: any,
    node: DynamicFormNode<Field>,
    currentPath: string,
    parentPath: string,
    nodePath: string,
    proplessInstance: any,
    onValueChanged: ((value: any) => void) | null
  ) {
    this.node = node;

    //paths
    this.nodePath = nodePath;
    this.parentPath = parentPath;
    this.currentPath = currentPath;
    this.proplessInstance = proplessInstance;
    this.onValueChanged = onValueChanged;

    //node complete reference. is this a good idea?
    this.currentNode = form.currentNode;

    //need this to trigger updates
    this.form = form;

    //it's a good ideia to resolve this as soon as possible to use it in the component shouldUpdate method
    this.value = this.proplessInstance.getValue(this);
  }

  getValue() {
    return this.value;
  }

  backOnePath() {
    if (this.currentNode.parent) {
      this.form.setPath(this.currentNode.parent);
    } else {
      console.warn("Parent is undefined, cannot call backOnePath");
    }
  }

  getCache(): { [key: string]: any } {
    let cache = this.form.cache[this.nodePath];
    if (cache == null) {
      cache = {};
      this.form.cache[this.nodePath] = cache;
    }
    return cache;
  }

  setValue(value: any, debounce: number = 0) {
    if (this.onValueChanged) {
      //if this property is defined, it will intercept any change
      this.onValueChanged(value);
      return;
    }

    this.proplessInstance.setValue(this, value);
    this.value = value;
    this.form.handleChange(this.node, debounce);
  }

  setPath(node: DynamicFormNode<Field>) {
    this.form.setPath(node);
  }

  // getValidationErrors(): Array<string>|null{
  //     return this.form.stateValidator.getValidationErrors(this.nodePath);
  // }
}
