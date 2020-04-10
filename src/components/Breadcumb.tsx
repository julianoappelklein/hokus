import * as React from "react";
import Border from "./Border";
import FlatButton from "material-ui/FlatButton";
import IconChevronRight from "material-ui/svg-icons/navigation/chevron-right";
import * as HoForm from "./HoForm";

type BreadcumbItemProps = {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
};

type BreadcumbItemState = {};

export class BreadcumbItem extends React.Component<BreadcumbItemProps, BreadcumbItemState> {
  render() {

    const style: React.CSSProperties = { minWidth: "30px", borderRadius: "0px" };
    if(this.props.disabled===true){
      style.color = '#000';
    }

    return (
      <FlatButton
        primary={true}
        style={style}
        disabled={this.props.disabled}
        label={this.props.label}
        onClick={this.props.onClick}
      />
    );
  }
}

type BreadcumbProps = {
  items: Array<React.ReactElement<typeof BreadcumbItem>>;
  style?: any;
};

type BreadcumbState = {};

export class Breadcumb extends React.Component<BreadcumbProps, BreadcumbState> {
  render() {
    let { items } = this.props;
    let newItems = [];

    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        newItems.push(
          <FlatButton
            key={"breadcumb-item-arrow-" + i}
            disabled={true}
            icon={<IconChevronRight />}
            style={{ minWidth: "30px" }}
          />
        );
      }

      newItems.push(React.cloneElement(items[i], { key: "breadcumb-item-" + i }));
    }

    return <Border style={Object.assign({ borderRadius: "2px" }, this.props.style)}>{newItems}</Border>;
  }
}

export class FormBreadcumb extends React.Component<HoForm.BreadcumbProps, {}> {
  render() {
    return (
      <Breadcumb
        style={{ marginBottom: 16 }}
        items={this.props.items.map(item => {
          if (item.node != null) {
            let node = item.node;
            return <BreadcumbItem label={item.label || "Untitled"} onClick={() => this.props.onNodeSelected(node)} />;
          } else {
            return <BreadcumbItem label={item.label || "Untitled"} disabled={true} />;
          }
        })}
      />
    );
  }
}
