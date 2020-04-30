import React from "react";
import { NormalizeStateContext, CrawlContext } from "../../HoForm";
import { BaseDynamic } from "../../HoForm";
import FormItemWrapper from "./shared/FormItemWrapper";
import MenuItem from "material-ui/MenuItem";
import SelectField from "material-ui/SelectField";
import Tip from "../../Tip";
import { setValidationErrorIntoState, getValidationError } from "../../HoForm/utils";

type SelectDynamicField = {
  key: string;
  type: string;
  default: string | string[];
  tip: string;
  title: string;
  options: Array<{ value: string; text: string }>;
  multiple?: boolean;
  required?: boolean;
};

type SelectDynamicState = {};

class SelectDynamic extends BaseDynamic<SelectDynamicField, SelectDynamicState> {
  normalizeState(x: NormalizeStateContext<SelectDynamicField>) {
    //TODO: clear if value is not a valid option?
    let key = x.field.key;
    let isArrayType = x.field.multiple === true;
    if (isArrayType) {
      if (x.state[key] == null || !Array.isArray(x.state[key])) {
        x.state[key] = x.field.default || [];
      }
    } else {
      if (x.state[key] === null || typeof x.state[key] !== "string") {
        x.state[key] = x.field.default || "";
      }
    }
  }

  getType() {
    return "select";
  }

  crawlComponent({ form, node }: CrawlContext<SelectDynamicField>): void {
    const value = this.getValueFromNode(node);

    if (node.field.required) {
      const invalid = value == null || value.length === 0;
      setValidationErrorIntoState(
        node.state,
        form.buildDisplayPath(node),
        invalid ? "The field is required." : undefined
      );
    }
  }

  handleChange = (e: any, index: number, payload: Array<string>) => {
    let { context } = this.props;
    let field = context.node.field;

    if (field.multiple === true) {
      context.setValue(payload);
    } else {
      if (field.options[index].value !== context.value) {
        context.setValue(field.options[index].value);
      }
    }
  };

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
          <SelectField
            floatingLabelText={field.title}
            floatingLabelFixed={true}
            value={context.value}
            errorText={error}
            multiple={field.multiple === true}
            onChange={this.handleChange}
            fullWidth={true}
          >
            {field.options.map((option, i) => (
              <MenuItem key={i} value={option.value} primaryText={option.text || option.value} />
            ))}
          </SelectField>
        }
        iconButtons={iconButtons}
      />
    );
  }
}

export default SelectDynamic;
