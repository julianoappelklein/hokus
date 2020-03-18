import * as React from "react";
import FormItemWrapper from "./shared/FormItemWrapper";
import TextField from "material-ui/TextField";
import Tip from "../../Tip";
import { BaseDynamic, NormalizeStateContext } from "../../HoForm";

type TextFieldDynamicField = {
  key: string;
  type: string;
  default: string;
  multiLine: boolean;
  tip: string;
  title: string;
};

type TextFieldDynamicState = {};

class TextFieldDynamic extends BaseDynamic<TextFieldDynamicField, TextFieldDynamicState> {
  normalizeState({ state, field }: NormalizeStateContext<TextFieldDynamicField>) {
    let key = field.key;
    if (state[key] === undefined) {
      state[key] = field.default || "";
    }
  }

  getType() {
    return "string";
  }

  handleChange = (e: React.FormEvent, value: any) => {
    this.forceUpdate();
    this.props.context.setValue(value, 250);
  };

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
            id={`text-field-${field.key}`}
            onChange={this.handleChange}
            value={context.value}
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

export default TextFieldDynamic;
