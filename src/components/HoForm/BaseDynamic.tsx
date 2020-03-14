import React from "react";
import Border from "./../Border";
import { ComponentProps, DynamicFormNode, BreadcumbItem, FieldBase, FieldBaseGroup } from "./types";
import { FieldsExtender } from "./fields-extender";
import { ComponentContext } from "./component-context";

export default class BaseDynamic<Field extends FieldBase, State> extends React.Component<
  ComponentProps<Field>,
  State & { hasError: boolean }
> {
  // override this to set defaults in the field configuration.
  extendField(field: FieldBaseGroup, extender: FieldsExtender): void {
    if (field.fields) {
      extender.extendFields(field.fields);
    }
  }

  // override this to set a initial value, a default value or a calculated value (e.g: "now" converts to a date).
  normalizeState({ state, field, stateBuilder }: { state: any; field: Field; stateBuilder: any }): void {}

  shouldComponentUpdate(nextProps: ComponentProps<Field>, nextState: State) {
    return true;
  }

  // override if the component is a container
  // the default behavior is fine for a leaf component
  buildPathFragment(node: DynamicFormNode<Field>, nodeLevel: number, nodes: Array<DynamicFormNode<FieldBase>>): string {
    return node.field.key;
  }

  // override if the component is a container
  //leaf components don't need to build a breadcumb fragment
  //but components that nest others must do
  buildBreadcumbFragment(currentNode: DynamicFormNode<Field>, items: Array<BreadcumbItem>): void {}

  // overriding this you can reallocate the state level. e.g: set it to the rootState.
  // this method was primarily created to allow components that manage resources to be
  // locatted at any level of the component tree
  allocateStateLevel(field: Field, parentState: any, rootState: any): void {
    return parentState;
  }

  // override these always
  renderComponent(): React.ReactNode {
    return <p>empty</p>;
  }

  // override this with a unique key for the component
  getType(): string {
    return "";
  }

  // override these bellow if the component have a non default getter/setter, like the ResourceManager
  getValue(context: ComponentContext<Field>): any {
    let value = context.node.state[context.node.field.key];
    if (value && Array.isArray(value)) value = value.slice(0);
    return value;
  }
  setValue(context: ComponentContext<Field>, value: any): void {
    context.node.state[context.node.field.key] = value;
  }
  clearValue(context: ComponentContext<Field>): void {
    delete context.node.state[context.node.field.key];
  }

  /*
   *  Don't override the methods below!
   */
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Display fallback UI
    this.setState(s => {
      return { ...s, hasError: true };
    });
    console.warn(error, info);
  }

  getSomethingWentWrongMessage(): React.ReactNode {
    let context = this.props.context;
    if (context === undefined) {
      return (
        <Border style={{ marginTop: 16 }}>
          <p style={{ margin: 16 }}>
            <span>Something went wrong while processing the </span>
            <b>{this.getType()}</b>
          </p>
        </Border>
      );
    }
    return (
      <Border style={{ marginTop: 16 }}>
        <p style={{ margin: 16 }}>
          <span>Something went wrong while processing the </span>
          <b>{this.getType()}</b>
          <span> of key </span>
          <b>{this.props.context!.node.field.key}</b>
          <pre>
            {JSON.stringify(
              {
                nodePath: context.nodePath,
                parentPath: context.parentPath
              },
              null,
              "  "
            )}
          </pre>
        </p>
      </Border>
    );
  }

  render(): React.ReactNode {
    if (this.state && this.state.hasError) {
      return this.getSomethingWentWrongMessage();
    }
    return this.renderComponent();
  }
}
