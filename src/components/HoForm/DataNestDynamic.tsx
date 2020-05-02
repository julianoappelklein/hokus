import { BaseDynamic } from "./BaseDynamic";
import { DynamicFormNode, NormalizeStateContext, ExtendFieldContext, CrawlContext } from "./types";

type DataNestField = {
  type: string;
  key: string;
  group: string | null;
  fields: Array<any>;
};

type DataNestState = {};

export class DataNestDynamic extends BaseDynamic<DataNestField, DataNestState> {
  allocateStateLevel(field: DataNestField, parentState: any, rootState: any) {
    let key = field.group || field.key;
    if (parentState[key] == null) parentState[key] = {};
    return parentState[key];
  }

  extendField({ field, extender }: ExtendFieldContext<DataNestField>): void {
    extender.extendFields(field.fields);
  }

  normalizeState({ state, field, stateBuilder }: NormalizeStateContext<DataNestField>) {
    stateBuilder.setLevelState(state, field.fields);
  }

  getType() {
    return "data-nest";
  }

  buildBreadcumbFragment(node: any, buttons: Array<{ label: string; node: any }>) {}

  crawlComponent({ form, node }: CrawlContext<DataNestField>): void {
    const { field, state } = node;
    const parent = node.parent as any;
    form.crawlLevel({ fields: field.fields, state, parent });
  }

  buildDisplayPathFragment(node: DynamicFormNode<DataNestField>) {
    return null;
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, parentPath } = context;
    let { field } = node;
    let level;
    if (currentPath.startsWith(parentPath)) {
      const state = node.state;
      level = context.form.renderLevel({ fields: field.fields, state, parent: node.parent as any });
    }
    return level;
  }
}
