import React from "react";
import { DynamicFormNode, FieldBase, NormalizeStateInput } from "../../HoForm";
import { BaseDynamic } from "../../HoForm";
import { FieldsExtender } from "../../HoForm/fields-extender";

type SectionDynamicField = {
  key: string;
  compositeKey: string;
  type: string;
  title: string;
  fields: Array<any>;
  groupdata?: boolean;
};

type SectionDynamicState = {};

class SectionDynamic extends BaseDynamic<SectionDynamicField, SectionDynamicState> {
  allocateStateLevel(field: SectionDynamicField, parentState: any, rootState: any) {
    if (field.groupdata == null || field.groupdata === true) {
      if (parentState[field.key] === undefined) parentState[field.key] = {};
      return parentState[field.key];
    }
    return parentState;
  }

  extendField(field: SectionDynamicField, fieldsExtender: FieldsExtender) {
    fieldsExtender.extendFields(field.fields);
  }

  normalizeState(x: NormalizeStateInput<SectionDynamicField>) {
    x.stateBuilder!.setLevelState(x.state, x.field.fields);
  }

  getType() {
    return "section";
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, nodePath, parentPath } = context;
    let { field } = node;

    if (currentPath === parentPath) {
      var state = node.state;
      var level = context.renderLevel({
        field,
        state,
        parent: node.parent
      });

      return (
        <React.Fragment>
          {field.title ? <div style={{ padding: "16px 0" }}>{field.title}</div> : undefined}
          <div
            style={{
              padding: "16px 0px 0px 16px",
              marginBottom: "16px",
              overflow: "auto",
              borderLeft: "solid 10px #eee"
            }}
          >
            {level}
          </div>
        </React.Fragment>
      );
    }

    if (currentPath.startsWith(nodePath)) {
      return context.renderLevel({
        field,
        state: node.state,
        parent: node
      });
    }

    return null;
  }
}

export default SectionDynamic;
