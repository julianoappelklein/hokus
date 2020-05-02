import * as React from "react";
import {
  ComponentContext,
  ComponentProps,
  DynamicFormNode,
  FieldBase,
  CrawlContext,
  NormalizeStateContext,
  ExtendFieldContext
} from "./types";

interface BaseState {
  hasError?: boolean;
}

export class BaseDynamic<Field extends FieldBase, State extends BaseState> extends React.Component<
  ComponentProps<Field>,
  State
> {
  // override this to set defaults in the field configuration.
  extendField({ field, extender }: ExtendFieldContext<Field>): void {
    if (field.field) {
      extender.extendFields([field.field]);
    }
    if (field.fields) {
      extender.extendFields([field.fields]);
    }
  }

  // override this to set a initial value, a default value or a calculated value (e.g: "now" converts to a date).
  normalizeState(ctx: NormalizeStateContext<Field>): void {}

  // override this to insert validation errors to be consumed by the component later.
  crawlComponent(ctx: CrawlContext<Field>): void {}

  shouldComponentUpdate(nextProps: ComponentProps<Field>, nextState: State) {
    return true;
  }

  // override if the component is a container
  // the default behavior is fine for a leaf component
  buildDisplayPathFragment(
    node: DynamicFormNode<Field>,
    nodeLevel: number,
    nodes: Array<DynamicFormNode<FieldBase>>
  ): string | null {
    return node.field.key;
  }

  // override if the component is a container
  //leaf components don't need to build a breadcumb fragment
  //but components that nest others must do
  buildBreadcumbFragment(
    currentNode: DynamicFormNode<Field>,
    items: Array<{ label: string; node: DynamicFormNode<FieldBase> | null }>
  ): void {}

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

  getValueFromNode(node: DynamicFormNode<Field>): any {
    let value = node.state[node.field.key];
    if (value && Array.isArray(value)) value = value.slice(0);
    return value;
  }

  setValue(context: ComponentContext<Field>, value: any): void {
    context.node.state[context.node.field.key] = value;
  }

  /*
   *  Don't override the methods below!
   */

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Display fallback UI

    //$FlowFixMe
    this.setState({ hasError: true });
    console.warn(error, info);
  }

  getSomethingWentWrongMessage(): React.ReactNode {
    let context = this.props.context;
    if (context == null) {
      return (
        <p style={{ margin: 16 }}>
          <span>Something went wrong while processing the </span>
          <b>{this.getType()}</b>
        </p>
      );
    }
    return (
      <p style={{ margin: 16 }}>
        <span>Something went wrong while processing the </span>
        <b>{this.getType()}</b>
        <span> of key </span>
        <b>{this.props.context.node.field.key}</b>
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
    );
  }

  render(): React.ReactNode {
    if (this.state && this.state.hasError) {
      return this.getSomethingWentWrongMessage();
    }
    return this.renderComponent();
  }
}

export default BaseDynamic;
