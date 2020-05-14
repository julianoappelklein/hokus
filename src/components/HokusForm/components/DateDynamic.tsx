import React from "react";
import FormItemWrapper from "./shared/FormItemWrapper";
import DatePicker from "material-ui/DatePicker";
import Tip from "../../Tip";
import { BaseDynamic } from "../../HoForm";
import IconClear from "material-ui/svg-icons/content/clear";
import IconButton from "material-ui/IconButton";

type DateDynamicField = {
  type: string;
  key: string;
  default: string | null | undefined;
  tip: string | null | undefined;
  title: string | null | undefined;
};

type DateDynamicState = {};

class DateDynamic extends BaseDynamic<DateDynamicField, DateDynamicState> {
  normalizeState({ state, field }: { state: any; field: DateDynamicField }): void {
    let key = field.key;
    if (state[key] === undefined) {
      state[key] = field.default || undefined;
    }

    if (state[key] === "now") {
      let date = this.formatDate(new Date());
    }
  }

  private formatDate(date: Date): string {
    return (date.getFullYear().toString().padStart(4, "0") +
      "-" + (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" + date.getDate().toString().padStart(2, "0")
    );
  }

  getType(): string {
    return "date";
  }

  getDateValue(): Date|undefined {
    let val = this.props.context.value;
    if (val === "now") {
      return new Date();
    } else if (val) {
      let values = val.split("-");
      const year = parseInt(values[0], 10);
      const month = parseInt(values[1], 10) - 1;
      const day = parseInt(values[2], 10);
      return new Date(year, month, day, 12);
    }
    return undefined;
  }

  setDateValue(value: Date) {
    const dateStr = this.formatDate(value);
    this.props.context.setValue(dateStr);
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath } = context;
    let { field } = node;

    if (currentPath !== context.parentPath) {
      return null;
    }

    let iconButtons = [];
    iconButtons.push(
      <IconButton onClick={() => context.setValue("")}>
        <IconClear />
      </IconButton>
    );
    if (field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={
          <DatePicker
            value={this.getDateValue()}
            onChange={(e: any, value: any) => {
              this.setDateValue(value);
            }}
            autoOk={true}
            fullWidth={true}
            underlineShow={true}
            floatingLabelText={field.title}
          />
        }
        iconButtons={iconButtons}
      />
    );
  }
}

export default DateDynamic;
