import React from "react";
import { ComponentContext } from "./component-context";
import { Debounce } from "./debounce";
import { FieldBase, FieldBaseGroup, DynamicFormNode, ComponentProps, BreadcumbComponentType } from "./types";
import { ComponentRegistry } from "./component-registry";
import { FormStateBuilder } from "./form-state-builder";
import { FieldsExtender } from "./fields-extender";

const Fragment = React.Fragment;
const componentMarginTop = "16px";

interface FormProps {
  values: any;
  fields: Array<any>;
  debug: boolean;
  rootName: string;
  componentRegistry: ComponentRegistry;
  breadcumbComponentType: BreadcumbComponentType;
  plugins: any;
  onChange?: (valuesGetter: () => any) => void;
}

interface FormState {
  path: string;
  document: any;
  fields: Array<any>; //we're going to use the fields from the state instead of the fields from props - it can't mutate
  renderError?: string;
}

class Form extends React.Component<FormProps, FormState> {
  currentNode?: DynamicFormNode<FieldBase>;
  root?: DynamicFormNode<FieldBase>;
  cache: any = {};
  stateBuilder: FormStateBuilder;
  forceUpdateThis?: () => void;

  constructor(props: FormProps) {
    super(props);
    this.stateBuilder = new FormStateBuilder(props.componentRegistry);

    try {
      let fields = JSON.parse(JSON.stringify(props.fields));
      new FieldsExtender(props.componentRegistry).extendFields(fields);

      let formState = JSON.parse(JSON.stringify(props.values || {}));
      this.stateBuilder.makeRootState(fields, formState);

      let root = {
        field: {
          key: "root",
          compositeKey: "root",
          type: "root"
        }
      } as DynamicFormNode<FieldBase>;
      this.root = root;
      this.currentNode = root;
      this.state = {
        document: formState,
        path: "ROOT/",
        fields: fields
      };

      this.forceUpdateThis = this.forceUpdate.bind(this);
      this.getFormDocumentClone = this.getFormDocumentClone.bind(this);
    } catch (error) {
      this.state = {
        document: {},
        path: "",
        fields: [],
        renderError: error.message
      };
    }
  }

  static shapeDocument(updatedDoc: {}, doc: {}) {}

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ renderError: error.message });
    console.warn(error, info);
  }

  static getDerivedStateFromProps(props: FormProps, state: FormState) {
    //if(state==null||state.initialValues!=props.values){
    //bool is
    // }
    return null;
  }

  setPath(node: DynamicFormNode<FieldBase>) {
    window.scrollTo(0, 0);
    this.currentNode = node;
    this.setState({ path: this.buildPath(node) });
  }

  buildPath(currentNode: DynamicFormNode<FieldBase> | null | undefined): string {
    if (currentNode == null) return "";
    let path = "";
    let nodes = [];
    let nodeLevel = 0;
    do {
      if (currentNode == null) break;
      nodes.push(currentNode);
      if (currentNode === this.root) {
        path = "ROOT/" + path;
      } else {
        let componentProplessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
        if (componentProplessInstace) {
          let fragment = componentProplessInstace.buildPathFragment(currentNode, nodeLevel++, nodes);
          if (fragment) {
            path = fragment + "/" + path;
          }
        } else {
          throw new Error("Could not find component of type " + currentNode.field.type);
        }
      }
      if (currentNode.parent == null) break;
      else {
        currentNode = currentNode.parent;
      }
    } while (true);

    return path;
  }

  renderField(node: DynamicFormNode<FieldBase>, onValueChanged?: (value: any) => void) {
    var { field } = node;
    let component = this.props.componentRegistry.get(field.type);
    try {
      if (component === undefined) throw new Error("Could not find component of type " + field.type);

      node.state = component.proplessInstance.allocateStateLevel(field, node.state, this.state.document);

      let nodePath = this.buildPath(node);
      let parentPath = this.buildPath(node.parent);

      let context = new ComponentContext(
        this,
        node,
        this.state.path,
        parentPath,
        nodePath,
        component.proplessInstance,
        onValueChanged
      );

      let DynamicComponent = component.classType;
      return <DynamicComponent key={field.key} context={context} />;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  /**
   * Render a level of components
   * Can be used recursively when called by a component
   *
   * @field - the parent field config of the level
   * @state - the level state
   * @uiState - hard to describe
   * @parent - the previous renderLevel context object
   */
  renderLevel({ field, state, uiState, parent }: DynamicFormNode<FieldBaseGroup>): React.ReactNode {
    if (this.props.debug) console.log("RENDER LEVEL");

    const fieldsElements = field.fields.map(childField => {
      let data = { field: childField, state: state, uiState, parent } as DynamicFormNode<FieldBase>;
      let field = this.renderField(data);
      if (this.props.debug) console.log("FIELD", data, field, this.buildPath(data));
      return field;
    });

    return <Fragment>{fieldsElements}</Fragment>;
  }

  getFormDocumentClone = () => {
    return JSON.parse(JSON.stringify(this.state.document));
  };

  forceUpdateDebounce: Debounce = new Debounce();
  handleChange(node: any, debounce: number) {
    if (this.forceUpdateThis) {
      this.forceUpdateDebounce.run(this.forceUpdateThis, debounce);
    }
    if (this.props.onChange != null) {
      this.props.onChange(this.getFormDocumentClone);
    }
  }

  renderBreadcumb() {
    let items = [];
    let nodes = [];
    let currentNode: DynamicFormNode<FieldBase> | undefined = this.currentNode;
    try {
      while (currentNode) {
        nodes.push(currentNode);
        if (currentNode === this.root) {
          items.push({ label: this.props.rootName || "ROOT", node: currentNode });
        } else {
          let componentPropslessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
          if (componentPropslessInstace && componentPropslessInstace.buildBreadcumbFragment) {
            componentPropslessInstace.buildBreadcumbFragment(currentNode, items);
          } else {
            throw new Error("Could not find component of type " + currentNode.field.type);
          }
        }
        currentNode = currentNode.parent;
      }
    } catch (e) {
      items.push({ label: "Error", node: this.root });
    }

    items.reverse();

    let Breadcumb = this.props.breadcumbComponentType;
    return <Breadcumb items={items} onNodeSelected={this.setPath.bind(this)} />;
  }

  getCurrentNodeDebugInfo() {
    let path;
    try {
      path = this.buildPath(this.currentNode);
    } catch (e) {
      path = e;
    }
    return { path: path };
  }

  render() {
    if (this.state.renderError) return <p style={{ color: "red", padding: "24px" }}>{this.state.renderError}</p>;

    let breadcumb = this.renderBreadcumb();

    let form = (
      <div key={"dynamic-form"} style={{ padding: "20px" }}>
        {breadcumb}

        {this.renderLevel({
          field: { fields: this.state.fields, key: "root", compositeKey: "root", type: "root" },
          state: this.state.document,
          parent: this.root
        })}

        {this.props.debug ? (
          <div
            style={{
              marginTop: componentMarginTop,
              overflow: "auto",
              border: "solid 1px #e8e8e8",
              borderRadius: "7px"
            }}
          >
            <pre style={{ padding: 16, margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(this.getCurrentNodeDebugInfo())}
            </pre>

            <pre style={{ padding: 16, margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(this.state, null, "   ")}
            </pre>
          </div>
        ) : (
          undefined
        )}
      </div>
    );

    return form;
  }
}

export default Form;
