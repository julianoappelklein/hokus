import { BaseDynamic, FieldBase, NormalizeStateInput } from "../../HoForm";
import { DynamicFormNode, FormStateBuilder } from "../../HoForm";
import { FieldsExtender } from "../../HoForm/fields-extender";

type PullDynamicField = {
  type: string;
  key: string;
  group: string | null | undefined;
  compositeKey: string;
  fields: Array<any>;
};

type PullDynamicState = {};

class PullDynamic extends BaseDynamic<PullDynamicField, PullDynamicState> {
  allocateStateLevel(field: PullDynamicField, parentState: any, rootState: any) {
    let key = field.group || field.key;
    if (parentState[key] === undefined) parentState[key] = {};
    return parentState[key];
  }

  extendField(field: PullDynamicField, fieldExtender: FieldsExtender) {
    fieldExtender.extendFields(field.fields);
  }

  normalizeState(x: NormalizeStateInput<PullDynamicField>) {
    x.stateBuilder!.setLevelState(x.state, x.field.fields);
  }

  getType() {
    return "pull";
  }

  buildBreadcumbFragment(node: any, buttons: Array<{ label: string; node: any }>) {}

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, nodePath } = context;
    let { field } = node;

    if (currentPath.startsWith(nodePath)) {
      var state = node.state;
      return context.renderLevel({ field, state, parent: node });
    }

    return null;
  }
}

export default PullDynamic;
