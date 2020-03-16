import React from "react";
import FlatButton from "material-ui/FlatButton";
import IconNavigationExpandLess from "material-ui/svg-icons/navigation/expand-less";
import IconNavigationExpandMore from "material-ui/svg-icons/navigation/expand-more";

type AccordionHeaderProps = {
  active: boolean;
  onClick: () => void;
  style: any;
  headerLeftItems: any;
  headerRightItems: any;
  label: string;
};

type AccordionHeaderState = {
}

class AccordionHeader extends React.PureComponent<AccordionHeaderProps, AccordionHeaderState> {
  // shouldComponentUpdate(props, state){
  //     return props.label != this.props.label
  //         || props.active != this.props.active;
  // }

  render() {
    let { active, headerLeftItems, headerRightItems, label, onClick, style } = this.props;
    return (
      <a style={style} onClick={onClick}>
        <span style={{ display: "inline-block", margin: "-10px 0px -10px -5px" }}>
          {headerLeftItems.map((item: any, index: number) => {
            return (
              <span key={index} style={{ display: "inline-block", margin: "0 5px" }}>
                {item}
              </span>
            );
          })}
        </span>
        <span style={{ position: "absolute", top: "8px", right: "5px" }}>
          {headerRightItems.map((item: any, index: number) => {
            return (
              <span key={index} style={{ display: "inline-block", margin: "0 5px" }}>
                {item}
              </span>
            );
          })}
          <FlatButton
            style={{ minWidth: "40px" }}
            icon={active ? <IconNavigationExpandLess /> : <IconNavigationExpandMore />}
          />
        </span>
        {label}
      </a>
    );
  }
}

class AccordionItem extends React.Component<any, {}> {
  render() {
    let {
      active,
      body,
      label,
      onHeadClick,
      headerRightItems = [],
      headerLeftItems = [],
      headStyle,
      bodyStyle,
      style,
      wrapperProps
    } = this.props;

    let _headStyle = Object.assign(
      {
        border: "solid 1px #e8e8e8",
        padding: "16px",
        display: "block",
        cursor: "pointer",
        marginTop: 8,
        position: "relative"
      },
      headStyle
    );

    let _bodyStyle = Object.assign(
      {
        display: active ? "block" : "none",
        padding: "8px 0",
        border: "solid 1px #e8e8e8",
        borderTopWidth: 0
      },
      bodyStyle
    );

    return (
      <div style={style} className="accordion-item" {...wrapperProps}>
        <AccordionHeader
          style={_headStyle}
          onClick={onHeadClick}
          headerLeftItems={headerLeftItems}
          headerRightItems={headerRightItems}
          active={active}
          label={label}
        />
        <div style={_bodyStyle}>{active ? body : null}</div>
      </div>
    );
  }
}

type AccordionProps = {
  index?: number;
}

type AccordionState = {
  index?: number;
}

class Accordion extends React.Component<any, AccordionState> {
  constructor(props: any) {
    super(props);
    this.state = { index: -1 };
  }

  getOpenedIndex = () => {
    if (this.props.index !== undefined) {
      return this.props.index;
    } else {
      return this.state.index;
    }
  }

  getHandleChange = (i: number) => {
    return (e: any) => {
      if (this.props.index !== undefined) {
        if (this.props.onChange) {
          this.props.onChange(i);
        }
      } else {
        let index = i !== this.state.index ? i : -1;
        this.setState(Object.assign({}, this.state, { index }));
      }
    };
  }

  render() {
    let openedIndex = this.getOpenedIndex();
    return (
      <div className="accordion" style={this.props.style}>
        {this.props.children||[].map(
          (item: any, index: number) => {
            let active = index === openedIndex;
            return React.cloneElement(item, {
              active,
              onHeadClick: this.getHandleChange(index)
            });
          }
        )}
      </div>
    );
  }
}

export { Accordion, AccordionItem };
