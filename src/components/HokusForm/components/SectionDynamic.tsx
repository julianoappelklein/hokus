import React from "react";
import { NormalizeStateContext, ExtendFieldContext, CrawlContext } from "../../HoForm";
import { BaseDynamic } from "../../HoForm";

type SectionDynamicField = {
  key: string;
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

  extendField({ field, extender }: ExtendFieldContext<SectionDynamicField>): void {
    extender.extendFields(field.fields);
  }

  crawlComponent({ form, node }: CrawlContext<SectionDynamicField>): void {
    const { field, state } = node;
    const parent = node.parent as any;
    form.crawlLevel({ fields: field.fields, state, parent });
  }

  normalizeState(x: NormalizeStateContext<SectionDynamicField>) {
    x.stateBuilder!.setLevelState(x.state, x.field.fields);
  }

  getType() {
    return "section";
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, parentPath } = context;
    let { field } = node;

    if (currentPath === parentPath) {
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
            {context.form.renderLevel({
              fields: field.fields,
              state: node.state,
              parent: node.parent as any
            })}
          </div>
        </React.Fragment>
      );
    }

    if (currentPath.startsWith(parentPath)) {
      return context.form.renderLevel({
        fields: field.fields,
        state: node.state,
        parent: node.parent as any
      });
    }

    return null;
  }
}

export default SectionDynamic;
