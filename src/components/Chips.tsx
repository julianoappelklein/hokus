import React, { TouchEventHandler } from "react";
import Chip from "material-ui/Chip";
import TextField from "material-ui/TextField";

const Fragment = React.Fragment;

class Chips extends React.Component<any, any> {
  private documentMouseUpListener: any;
  constructor(props: any) {
    super(props);
    this.state = {
      value: "",
      dragFromIndex: undefined,
      dragToIndex: undefined
    };
  }

  onChangeHandler = (e: any, newVal: any) => {
    this.setState(Object.assign({}, this.state, { value: newVal }));
  };

  onKeyPressHandler(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.props.onPushItem) this.props.onPushItem(this.state.value);
      this.setState({ value: "" });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.documentMouseUpListener);
  }

  getOnRequestDelete(index: number): TouchEventHandler<Chip> {
    return (e: React.TouchEvent<Chip>) => {
      e.stopPropagation();
      if (this.props.onRequestDelete) {
        this.props.onRequestDelete(index);
      }
    };
  }

  //DRAG EVENTS
  getDocumentMouseUpListener() {
    this.documentMouseUpListener = (e: Event) => {
      if (this.props.onSwap) {
        this.props.onSwap(e, { index: this.state.dragFromIndex, otherIndex: this.state.dragToIndex });
      }
      this.setState(Object.assign({}, this.state, { dragFromIndex: undefined, dragToIndex: undefined }));
      document.removeEventListener("mouseup", this.documentMouseUpListener);
    };
    return this.documentMouseUpListener;
  }

  getOnItemMouseDown(index: number): TouchEventHandler<Chip> {
    return e => {
      if (this.props.sortable) {
        e.stopPropagation();
        e.preventDefault();
        this.setState(Object.assign({}, this.state, { dragFromIndex: index, dragToIndex: index }));
        document.addEventListener("mouseup", this.getDocumentMouseUpListener());
      }
    };
  }

  getOnItemMouseEnter(index: number): TouchEventHandler<Chip> {
    return () => {
      if (this.state.dragFromIndex !== undefined) {
        this.setState(Object.assign({}, this.state, { dragToIndex: index }));
      }
    };
  }

  renderChip(index: number, label: string, opacity?: number) {
    return (
      <Chip
        key={"chip-" + index}
        style={{ opacity: opacity, margin: "2px" }}
        onRequestDelete={this.getOnRequestDelete(index)}
        // @ts-ignore
        onMouseDown={this.getOnItemMouseDown(index)}
        onMouseEnter={this.getOnItemMouseEnter(index)}
      >
        {label}
      </Chip>
    );
  }

  renderDecoyChip(index: number, label: string, opacity: number) {
    return (
      <Chip key={"decoy-chip-" + index} style={{ opacity: opacity, margin: "2px" }}>
        {label}
      </Chip>
    );
  }

  render() {
    let { dragToIndex, dragFromIndex } = this.state;

    return (
      <Fragment>
        <TextField
          floatingLabelFixed={true}
          multiLine={false}
          value={this.state.value}
          onChange={this.onChangeHandler.bind(this)}
          underlineShow={this.props.underlineShow}
          fullWidth={this.props.fullWidth}
          floatingLabelText={this.props.field.title}
          onKeyPress={this.onKeyPressHandler.bind(this)}
        />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {this.props.items.map((item: string, index: number) => {
            if (index === dragFromIndex) {
              return this.renderChip(index, item, dragFromIndex !== dragToIndex ? 0.15 : 1);
            }

            if (index === dragToIndex) {
              let movedChip = this.renderDecoyChip(index, this.props.items[dragFromIndex], 1);
              let beforeChip, afterChip;
              if (dragFromIndex < dragToIndex) afterChip = movedChip;
              else beforeChip = movedChip;
              return (
                <Fragment key={"chip" + index}>
                  {beforeChip}
                  {this.renderChip(index, item)}
                  {afterChip}
                </Fragment>
              );
            } else {
              return this.renderChip(index, item);
            }
          })}
        </div>
      </Fragment>
    );
  }
}

export default Chips;
