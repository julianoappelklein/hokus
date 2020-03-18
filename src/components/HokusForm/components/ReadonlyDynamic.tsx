import React from "react";
import FormItemWrapper from "./shared/FormItemWrapper";
import TextField from "material-ui/TextField";
import Tip from "../../Tip";
import { FormStateBuilder, NormalizeStateContext } from "../../HoForm";
import { BaseDynamic } from "../../HoForm";

type ReadonlyDynamicField = {
  key: string;
  type: string;
  title: string;
  tip: string | null | undefined;
  default: string | null | undefined;
  multiLine: boolean | null | undefined;
};

type ReadonlyDynamicState = {};

class ReadonlyDynamic extends BaseDynamic<ReadonlyDynamicField, ReadonlyDynamicState> {
  normalizeState(x: NormalizeStateContext<ReadonlyDynamicField>) {
    let key = x.field.key;
    if (x.state[key] === undefined) {
      x.state[key] = x.field.default || "";
    }
  }

  getType() {
    return "readonly";
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, parentPath } = context;
    let { field } = node;

    if (currentPath !== parentPath) {
      return null;
    }

    let iconButtons = [];
    if (field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={
          <TextField
            underlineFocusStyle={{ borderColor: "#bbb" }}
            textareaStyle={{ color: "#999" }}
            inputStyle={{ color: "#999" }}
            value={context.value || ""}
            floatingLabelFixed={true}
            multiLine={field.multiLine === true}
            underlineShow={true}
            fullWidth={true}
            floatingLabelText={field.title}
          />
        }
        iconButtons={iconButtons}
      />
    );
  }
}

export default ReadonlyDynamic;
