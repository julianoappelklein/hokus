import * as React from "react";

import { Popover, Menu, MenuItem } from "material-ui";

type TriggerWithOptionsProps = {
  options: Array<string>;
  onOptionClick: (e: any, index: number) => boolean | null | undefined;
  triggerType: any;
  triggerProps: any;
  menuProps?: any;
  popoverProps?: any;
  onOpen?: (e: any) => void;
};

type TriggerWithOptionsState = {
  open: boolean;
  anchorEl: any | null | undefined;
};

export class TriggerWithOptions extends React.Component<TriggerWithOptionsProps, TriggerWithOptionsState> {
  constructor(props: TriggerWithOptionsProps) {
    super(props);

    this.state = {
      anchorEl: null,
      open: false
    };
  }

  handleTriggerClick = (event: any) => {
    event.preventDefault();

    if (this.props.onOpen != null) {
      this.props.onOpen(event);
    }

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleMenuItemClick = (event: any, menuItem: any, index: number) => {
    let result = this.props.onOptionClick(event, index);
    if (result !== false) this.setState({ open: false });
  };

  render() {
    let { triggerProps, options, menuProps, popoverProps } = this.props;
    let TriggerType = this.props.triggerType;
    return (
      <React.Fragment>
        <TriggerType {...triggerProps} onClick={this.handleTriggerClick} />
        <Popover
          {...popoverProps}
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          targetOrigin={{ horizontal: "left", vertical: "top" }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu onItemClick={this.handleMenuItemClick} {...menuProps}>
            {options.map((x, i) => (
              <MenuItem key={i} primaryText={x} />
            ))}
          </Menu>
        </Popover>
      </React.Fragment>
    );
  }
}
