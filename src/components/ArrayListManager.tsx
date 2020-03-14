import React from "react";

import Border from "./Border";

//Material UI Components
import FlatButton from "material-ui/FlatButton";
import { List, ListItem } from "material-ui/List";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import Toggle from "material-ui/Toggle";

//Material UI Icons
import IconAdd from "material-ui/svg-icons/content/add";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import IconArrowUp from "material-ui/svg-icons/navigation/expand-less";
import IconArrowDown from "material-ui/svg-icons/navigation/expand-more";
import IconChevronRight from "material-ui/svg-icons/navigation/chevron-right";
import IconDelete from "material-ui/svg-icons/action/delete";

const Fragment = React.Fragment;
const componentMarginTop = "20px";

class ArrayListManager extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { edit: false };
  }

  onToggleEditClickHandler() {
    let newState = Object.assign({}, this.state, { edit: !this.state.edit });
    this.setState(newState);
  }

  onAddNewClickHandler = (e: any) => {
    if (this.props.onAddNewClickHandler) {
      this.props.onAddNewClickHandler(e);
    }
  };

  getOnItemTitleChangeValueHandler(index: any, titleKey: any) {
    return (e: any, newValue: any) => {
      if (this.props.onItemTitleChangeValueHandler)
        this.props.onItemTitleChangeValueHandler(e, index, titleKey, newValue);
    };
  }

  getOnItemsSwappedHandler(index: number, withPrevious: boolean) {
    return (e: any) => {
      if (this.props.onItemsSwappedHandler) {
        if (withPrevious && index - 1 >= 0) {
          this.props.onItemsSwappedHandler(e, { index, otherIndex: index - 1 });
        } else if (!withPrevious && index + 1 < this.props.items.length) {
          this.props.onItemsSwappedHandler(e, { index, otherIndex: index + 1 });
        }
      }
    };
  }

  getOnDeleteItem = (index: number) => (e: any) => {
    if (this.props.onItemDeleteHandler) {
      this.props.onItemDeleteHandler(e, index);
    }
  };

  getOnItemClickHandler = (index: number) => (e: any) => {
    if (this.props.onItemClickHandler) this.props.onItemClickHandler(e, index);
  };

  render() {
    let field = this.props.field;
    let items = this.props.items;
    return (
      <Fragment>
        <Border style={{ marginTop: componentMarginTop }}>
          <List>
            {items.map((data: any, i: number) => {
              if (this.state.edit) {
                //EDITABLE
                let primaryText = `Item ${i}`;
                let titleKey;
                for (let j = 0; j < field.fields.length; j++) {
                  if (field.fields[j].arrayTitle) {
                    titleKey = field.fields[j].key;
                    primaryText = data[titleKey];
                    break;
                  }
                }
                return (
                  <ListItem
                    disabled={true}
                    data-type={"nest-header"}
                    key={field.key + "-item-header-" + i}
                    innerDivStyle={{ paddingTop: "0px", paddingBottom: "0px" }}
                    leftIcon={<IconFileFolder />}
                    primaryText={
                      <Fragment>
                        {titleKey ? (
                          <TextField
                            id={field.key + "-item-header-text" + i}
                            key={field.key + "-item-header-text" + i}
                            onChange={this.getOnItemTitleChangeValueHandler(i, titleKey)}
                            value={data[titleKey]}
                          />
                        ) : (
                          <TextField
                            id={field.key + "-item-header-text" + i}
                            key={field.key + "-item-header-text" + i}
                            disabled={true}
                            value={primaryText}
                          />
                        )}
                        <FlatButton
                          style={{ minWidth: "40px" }}
                          icon={<IconArrowUp />}
                          onClick={this.getOnItemsSwappedHandler(i, true)}
                        />
                        <FlatButton
                          style={{ minWidth: "40px" }}
                          icon={<IconArrowDown />}
                          onClick={this.getOnItemsSwappedHandler(i, false)}
                        />
                        <FlatButton
                          style={{ minWidth: "40px" }}
                          icon={<IconDelete />}
                          onClick={this.getOnDeleteItem(i)}
                        />
                      </Fragment>
                    }
                  />
                );
              } else {
                //READONLY
                let primaryText = `Item ${i}`;
                for (let j = 0; j < field.fields.length; j++) {
                  if (field.fields[j].arrayTitle) {
                    primaryText = data[field.fields[j].key];
                    break;
                  }
                }
                return (
                  <ListItem
                    data-type={"nest-header"}
                    key={field.key + "-item-header-" + i}
                    onClick={this.getOnItemClickHandler(i)}
                    leftIcon={<IconFileFolder />}
                    rightIcon={<IconChevronRight />}
                    primaryText={primaryText || <span>&nbsp;</span>}
                  />
                );
              }
            })}
          </List>
        </Border>
        <RaisedButton
          style={{ marginTop: componentMarginTop }}
          onClick={this.onAddNewClickHandler.bind(this)}
          icon={<IconAdd />}
        />
        <Toggle
          label={"Edit"}
          style={{ width: "auto", display: "inline-table", marginLeft: "20px" }}
          labelPosition={"right"}
          toggled={this.state.edit}
          onToggle={this.onToggleEditClickHandler.bind(this)}
        />
      </Fragment>
    );
  }
}

export default ArrayListManager;
