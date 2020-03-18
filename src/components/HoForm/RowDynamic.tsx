import * as React from "react";
import { BaseDynamic, CrawlContext } from ".";
import { FieldBase, NormalizeStateContext, ExtendFieldContext } from "./types";

type RowDynamicField = {
  key: string;
  type: string;
  cols: Array<{ fields: Array<FieldBase>; weight: number }>;
};
const RowDynamicBuilder = (options: { gap: number }) => {
  return class RowDynamic extends BaseDynamic<RowDynamicField, {}> {
    allocateStateLevel(field: RowDynamicField, parentState: any, rootState: any) {
      return parentState;
    }

    normalizeState({ state, field, stateBuilder }: NormalizeStateContext<RowDynamicField>) {
      for (let i = 0; i < field.cols.length; i++) {
        const col = field.cols[i];
        stateBuilder.setLevelState(state, col.fields);
      }
    }

    extendField({ field, extender }: ExtendFieldContext<RowDynamicField>): void {
      for (let i = 0; i < field.cols.length; i++) {
        const col = field.cols[i];
        extender.extendFields(col.fields);
      }
    }

    getType() {
      return "row";
    }

    buildBreadcumbFragment(node: any, buttons: Array<{ label: string; node: any }>) {}

    buildDisplayPathFragment(node: any) {
      return null;
    }

    crawlComponent({ form, node }: CrawlContext<RowDynamicField>): void {
      const { field, state } = node;

      for (let i = 0; i < field.cols.length; i++) {
        const col = field.cols[i];
        form.crawlLevel({ fields: col.fields, state, parent: node });
      }
    }

    renderComponent() {
      let { context } = this.props;
      let { node, currentPath, nodePath, parentPath } = context;
      let { field } = node;

      var state = node.state;
      const { gap } = options;

      if (currentPath === parentPath) {
        return (
          <div style={{ display: "flex", marginLeft: -gap / 2, marginRight: -gap / 2 }}>
            {field.cols.map((col, i) => {
              return (
                <div key={`col-${i}`} style={{ flex: col.weight, paddingLeft: gap / 2, paddingRight: gap / 2 }}>
                  {context.form.renderLevel({ fields: col.fields, state, parent: node.parent as any })}
                </div>
              );
            })}
          </div>
        );
      }

      if (currentPath.startsWith(nodePath)) {
        return (
          <React.Fragment>
            {(field.cols || []).map((x: { weight: number; fields: Array<FieldBase> }, i: number) => {
              return (
                <React.Fragment key={`col-${i}`}>
                  {context.form.renderLevel({ fields: x.fields, state, parent: node.parent as any })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      }

      return null;
    }
  };
};

const RowDynamic = RowDynamicBuilder({ gap: 18 });

export default RowDynamic;
