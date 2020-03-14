import { FieldBase, DynamicFormNode } from "./types";
import Form from "./Form";
export class ComponentContext<Field extends FieldBase> {
  node: DynamicFormNode<Field>;
  currentNode: DynamicFormNode<Field>;

  nodePath: string;
  parentPath: string;
  currentPath: string;
  proplessInstance: any;

  onValueChanged?: (value: any) => void;

  form: Form;
  value: any;

  //remove those?
  renderLevel: any;
  renderField: any;
  setLevelState: any;

  constructor(
    form: any,
    node: DynamicFormNode<Field>,
    currentPath: string,
    parentPath: string,
    nodePath: string,
    proplessInstance: any,
    onValueChanged?: (value: any) => void
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

    //functions borowed from the DynamicForm
    this.renderLevel = form.renderLevel.bind(form); //don't know why, but this solved a huge nasty bug!
    this.renderField = form.renderField.bind(form); //don't know why, but this solved a huge nasty bug!
    this.setLevelState = form.stateBuilder.setLevelState.bind(form.stateBuilder);

    //it's a good ideia to resolve this as soon as possible to use it in the component shouldUpdate method
    this.value = this.proplessInstance.getValue(this);
  }

  getCache() {
    let cache = this.form.cache[this.node.field.compositeKey];
    if (cache == null) {
      cache = {};
      this.form.cache[this.node.field.compositeKey] = cache;
    }
    return cache;
  }

  getValue() {
    return this.value;
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

  clearValue() {
    if (this.onValueChanged) {
      this.onValueChanged(undefined);
      return;
    }
    this.proplessInstance.clearValue(this);
    this.form.handleChange(this.node, 0);
  }

  setPath(node: DynamicFormNode<Field>) {
    this.form.setPath(node);
  }

  backOnePath() {
    if (this.currentNode.parent) {
      this.form.setPath(this.currentNode.parent);
    } else {
      console.warn("Parent is undefined, cannot call backOnePath");
    }
  }

  findNodeInCurrentNodeTree(node: DynamicFormNode<Field>) {
    let cNode: DynamicFormNode<FieldBase> | undefined = this.currentNode;
    while (cNode) {
      if (cNode.field.compositeKey === node.field.compositeKey) return cNode;
      cNode = cNode.parent;
    }
    return undefined;
  }

  findPreviousNodeInCurrentNodeTree(node: DynamicFormNode<Field>) {
    let cNode: DynamicFormNode<FieldBase> | undefined = this.currentNode;
    let pNode = undefined;
    while (cNode) {
      if (cNode.field.compositeKey === node.field.compositeKey) return pNode;
      pNode = cNode;
      cNode = cNode.parent;
    }
    return undefined;
  }
}
