import * as React from "react";
import FormItemWrapper from "./shared/FormItemWrapper";
import TextField from "material-ui/TextField";
import Tip from "../../Tip";
import { BaseDynamic, NormalizeStateContext, CrawlContext } from "../../HoForm";
import { setValidationErrorIntoState, getValidationError } from "../../HoForm/utils";

type TextFieldDynamicField = {
  key: string;
  type: string;
  default: string;
  multiLine: boolean;
  tip: string;
  title: string;
  pattern?: string;
  required?: boolean;
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

  crawlComponent({ form, node }: CrawlContext<TextFieldDynamicField>): void {
    const value = this.getValueFromNode(node);
    if (node.field.required || node.field.pattern) {
      let validationError = "";
      if (node.field.required) {
        const invalid = value == null || value === "";
        validationError += invalid ? `The field is required.` : "";
      }
      if (value && node.field.pattern) {
        if (!new RegExp(node.field.pattern).test(value)) {
          validationError += `The value format is invalid.`;
        }
      }
      setValidationErrorIntoState(node.state, form.buildDisplayPath(node), validationError);
    }
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, parentPath, nodePath } = context;
    let { field } = node;

    if (!parentPath.startsWith(currentPath)) {
      return null;
    }

    let iconButtons = [];
    if (field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    const error = getValidationError(node.state, nodePath);

    return (
      <FormItemWrapper
        control={
          <TextField
            errorText={error}
            id={`text-field-${field.key}`}
            onChange={this.handleChange}
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

export default TextFieldDynamic;
