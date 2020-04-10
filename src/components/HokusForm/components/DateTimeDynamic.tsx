import React from "react";
import { BaseDynamic } from "../../HoForm";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { Box } from "@material-ui/core";

interface DateTimeFields {
  type: string;
  key: string;
  default?: string;
  title?: string;
}

class DateTimeDynamic extends BaseDynamic<DateTimeFields, { hasError?: boolean; selectedDateString?: string }> {
  constructor(p: any) {
    super(p);
    this.state = {};
  }

  componentDidMount() {
    this.setState({
      selectedDateString: this.props.context.value
    });
  }

  normalizeState({ state, field }: { state: any; field: DateTimeFields }) {
    const key = field.key;
    if (!state[key]) {
      state[key] = field.default === "now" ? new Date().toISOString() : field.default;
    }
  }

  getType() {
    return "datetime";
  }

  private handleDateChange = (date: MaterialUiPickersDate) => {
    this.setState({ selectedDateString: date?.toISOString() ?? "" });
    this.props.context.setValue(date ? date.toISOString() : "");
  };

  renderComponent() {
    const { context } = this.props;
    const { currentPath } = context;
    if (currentPath !== context.parentPath) {
      return null;
    }
    if (!this.state.selectedDateString) {
      return null;
    }
    return (
      <Box style={{ marginBottom: "12px" }}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DateTimePicker
            value={this.state.selectedDateString}
            onChange={this.handleDateChange}
            label={this.props.context.node.field.title ?? "Date time picker"}
            showTodayButton
          />
        </MuiPickersUtilsProvider>
      </Box>
    );
  }
}

export default DateTimeDynamic;
