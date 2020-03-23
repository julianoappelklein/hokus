import React from "react";
import { BaseDynamic } from "../../HoForm";

type EmptyLineDynamicField = {
  key: string;
  type: string;
  amount: number | null | undefined;
};

type EmptyLineDynamicState = {};

class EmptyLineDynamic extends BaseDynamic<EmptyLineDynamicField, EmptyLineDynamicState> {
  getType() {
    return "empty-line";
  }

  renderComponent() {
    debugger;
    let { context } = this.props;
    let { node, currentPath, parentPath } = context;
    let { field } = node;

    if (!parentPath.startsWith(currentPath)) {
      return null;
    }

    return <div style={{ height: (field.amount || 1) + "em" }}></div>;
  }
}

export default EmptyLineDynamic;
