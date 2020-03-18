import React from "react";
import { Accordion, AccordionItem } from "./../../Accordion";
import { ListItem, FlatButton, List, RaisedButton, MenuItem, IconMenu } from "material-ui";
import IconAdd from "material-ui/svg-icons/content/add";
import IconSort from "material-ui/svg-icons/editor/drag-handle";
import IconChevronRight from "material-ui/svg-icons/navigation/chevron-right";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import IconMore from "material-ui/svg-icons/navigation/more-vert";
import dynamicComponentUtils from "./../components/shared/dynamic-component-utils";
import {
  DynamicFormNode,
  ComponentProps,
  FieldBase,
  CrawlContext,
  NormalizeStateContext,
  ExtendFieldContext
} from "../../HoForm";
import { BaseDynamic } from "../../HoForm";
import { hasValidationErrorInTree } from "../../HoForm/utils";

const Fragment = React.Fragment;

type AccordionDynamicField = {
  title: string;
  fields: Array<any>;
  groupdata: boolean | null;
  itemTitleKey?: string;
  itemTitleFallbackKey?: string;
} & FieldBase;

type AccordionDynamicState = {
  dragFromIndex: number | null;
  dragToIndex: number | null;
  hasError?: boolean;
  menuOpen: boolean;
  menuIndex: number;
};

class AccordionDynamic extends BaseDynamic<AccordionDynamicField, AccordionDynamicState> {
  documentMouseUpListener: (e: any) => void = e => {};

  constructor(props: ComponentProps<AccordionDynamicField>) {
    super(props);
    this.state = { dragFromIndex: null, dragToIndex: null, menuOpen: false, menuIndex: 0 };
  }

  extendField({ field, extender }: ExtendFieldContext<AccordionDynamicField>): void {
    extender.extendFields(field.fields);
  }

  getType() {
    return "accordion";
  }

  normalizeState({ state, field, stateBuilder }: NormalizeStateContext<AccordionDynamicField>) {
    dynamicComponentUtils.normalizeStateForArrayOfObject(state, field, stateBuilder);
  }

  buildBreadcumbFragment(
    currentNode: DynamicFormNode<AccordionDynamicField>,
    items: Array<{ label: string; node: DynamicFormNode<FieldBase> | null }>
  ): void {
    if (items.length > 0) {
      //has a previous item
      var previousItem = items[items.length - 1];
      const parent = (previousItem as any).node.parent as any;
      const indexKey = this.genIndexKey(currentNode.field);
      const index = currentNode.state[indexKey];
      items.push({
        label: this.resolveItemLabel(parent.field, parent.state[parent.field.key][index], index),
        node: { ...currentNode, state: { ...currentNode.state, [indexKey]: index } }
      });
    }
    items.push({ label: currentNode.field.title, node: currentNode /*: any*/ });
  }

  buildDisplayPathFragment(node: any, nodeLevel: any, nodes: any) {
    if (nodeLevel > 0) return node.field.key + "/" + node.state[this.genIndexKey(node.field)];
    return node.field.key;
  }

  genIndexKey(field: FieldBase) {
    return `__${field.key}.index`;
  }

  getIndexKey() {
    return this.genIndexKey(this.props.context.node.field);
  }

  handleAddClick() {
    let context = this.props.context;
    let copy = (context.value || []).slice(0);
    let newData = {};
    context.form.stateBuilder.setLevelState(newData, context.node.field.fields);
    copy.push(newData);
    context.setValue(copy);
  }

  handleCloneItemAfterClick = (e: any) => {
    let context = this.props.context;
    let copy = (context.value || []).slice(0);
    const index = this.state.menuIndex;
    let newData = JSON.parse(JSON.stringify(copy[index]));
    copy.splice(index + 1, 0, newData);
    context.setValue(copy);
    this.setState({ menuOpen: false });
  };

  handleNewItemAfterClick = (e: any) => {
    let context = this.props.context;
    let copy = (context.value || []).slice(0);
    const index = this.state.menuIndex;
    let newData = {};
    context.form.stateBuilder.setLevelState(newData, context.node.field.fields);
    copy.splice(index + 1, 0, newData);
    context.setValue(copy);
    this.setState({ menuOpen: false });
  };

  handleRemoveItemClick = (e: any) => {
    setTimeout(() => this.removeItemAtIndex(this.state.menuIndex), 1);
  };

  removeItemAtIndex(i: number) {
    let context = this.props.context;
    let copy = (context.value || []).slice(0);
    copy.splice(i, 1);
    context.setValue(copy);
  }

  swapItems({ index, otherIndex }: { index: number; otherIndex: number }) {
    if (index === otherIndex) return;
    let context = this.props.context;
    let copy = (context.value || []).slice(0);
    let temp = copy[index];
    copy[index] = copy[otherIndex];
    copy[otherIndex] = temp;
    context.setValue(copy);
  }

  moveItem({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) {
    if (fromIndex === toIndex) return;
    let context = this.props.context;
    let copy: Array<any> = (context.value || []).slice(0);
    copy.splice(toIndex, 0, copy.splice(fromIndex, 1)[0]);
    context.setValue(copy);
  }

  handleMenuOpenClick = (e: any) => {
    e.stopPropagation();
    this.setState({ menuOpen: true, menuIndex: parseInt(e.currentTarget.firstElementChild.dataset.index) });
  };

  handleMenuClose = (e: any) => {
    this.setState({ menuOpen: false });
  };

  //DRAG EVENTS
  getDocumentMouseUpListener() {
    this.documentMouseUpListener = (e: any) => {
      if (this.state.dragFromIndex != null && this.state.dragToIndex != null) {
        this.moveItem({ fromIndex: this.state.dragFromIndex, toIndex: this.state.dragToIndex });
        this.setState({ dragFromIndex: null, dragToIndex: null });
      }
      document.removeEventListener("mouseup", this.documentMouseUpListener);
    };
    return this.documentMouseUpListener;
  }

  getOnItemDragHandleMouseDown(index: number) {
    return (e: any) => {
      if (true /*this.props.sortable*/) {
        this.setState({ dragFromIndex: index, dragToIndex: index });
        document.addEventListener("mouseup", this.getDocumentMouseUpListener());
      }
    };
  }

  getOnItemMouseEnter(index: number) {
    return (e: any) => {
      if (this.state.dragFromIndex != null) {
        this.setState({ dragToIndex: index });
      }
    };
  }

  crawlComponent({ form, node }: CrawlContext<AccordionDynamicField>): void {
    const value = this.getValueFromNode(node) || [];
    const indexKey = this.genIndexKey(node.field);
    for (let childIndex = 0; childIndex < value.length; childIndex++) {
      const nodeWithAdjustedIndex = { ...node, state: { ...node.state, [indexKey]: childIndex } };
      const state = value[childIndex];
      const { field } = node;
      form.crawlLevel({ fields: field.fields, state: state, parent: nodeWithAdjustedIndex });
    }
  }

  resolveItemLabel(field: any, state: any, childIndex: number) {
    let label;
    if (field.itemTitleKey) {
      label = state[field.itemTitleKey];
      if (!label && field.itemTitleFallbackKey) {
        label = state[field.itemTitleFallbackKey];
      }
    }
    if (!label) label = `Item ${childIndex + 1}`;
    return label;
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath } = context;
    let { field } = node;

    if (node.state[this.getIndexKey()] == null) {
      node.state[this.getIndexKey()] = -1;
    }

    if (currentPath === context.parentPath) {
      return (
        <List style={{ marginBottom: 16, padding: 0 }}>
          <ListItem
            style={{ border: "solid 1px #e8e8e8", borderRadius: "7px" }}
            onClick={function() {
              context.setPath(node);
            }}
            primaryText={`${field.title} (${(context.value || []).length})`}
            leftIcon={<IconFileFolder />}
            rightIcon={<IconChevronRight />}
          />
        </List>
      );
    }

    if (currentPath === context.nodePath) {
      let { dragToIndex, dragFromIndex } = this.state;

      let renderItem = (componentKey: string, childIndex: number, isDragging: boolean = false) => {
        let newNode = {
          fields: field.fields,
          state: context.value[childIndex],
          parent: node
        };

        let label = this.resolveItemLabel(field, newNode.state, childIndex);

        let background;
        if (isDragging) {
          background = "#eee";
        }

        const hasError = hasValidationErrorInTree(node.state[field.key][childIndex]);

        const body = isDragging
          ? null
          : context.node.state[this.getIndexKey()] == childIndex
          ? context.form.renderLevel(newNode)
          : null;

        return (
          <AccordionItem
            key={componentKey}
            label={label}
            style={{ background }}
            bodyStyle={body == null ? { display: "none" } : { padding: "16px 16px 16px 16px" }}
            body={body}
            error={hasError}
            wrapperProps={{ onMouseEnter: this.getOnItemMouseEnter(childIndex) }}
            headerRightItems={[
              <FlatButton
                onClick={e => e.stopPropagation()}
                onMouseDown={this.getOnItemDragHandleMouseDown(childIndex)}
                icon={<IconSort opacity={0.3} />}
                style={{ minWidth: 40, cursor: "move" }}
              />,
              <IconMenu
                useLayerForClickAway={true}
                iconButtonElement={<FlatButton data-index={childIndex} style={{ minWidth: 40 }} icon={<IconMore />} />}
                onClick={this.handleMenuOpenClick}
              >
                <MenuItem primaryText="Clone Item After" onClick={this.handleCloneItemAfterClick} />
                <MenuItem primaryText="New Item After" onClick={this.handleNewItemAfterClick} />
                <MenuItem primaryText="Remove" onClick={this.handleRemoveItemClick} />
              </IconMenu>
            ]}
          />
        );
      };
      return (
        <Fragment>
          <Accordion
            index={node.state[this.getIndexKey()]}
            onChange={(index: number) => {
              const currentIndex = node.state[this.getIndexKey()];
              node.state[this.getIndexKey()] =
                currentIndex == null || currentIndex == -1 || currentIndex !== index ? index : -1;
              context.form.forceUpdate();
            }}
          >
            {(context.value || []).map((item: any, childIndex: number) => {
              let componentKey = `item-${childIndex}`;
              if (childIndex === dragFromIndex) {
                return renderItem(componentKey, childIndex, true);
              }

              if (childIndex === dragToIndex && dragFromIndex != null && dragToIndex != null) {
                let movedItem = (
                  <div
                    style={{ margin: "8px 0", height: "8px", background: "#00bcd4" /*cyan500*/, borderRadius: 3 }}
                  ></div>
                );
                let beforeItem, afterItem;
                if (dragFromIndex < dragToIndex) afterItem = movedItem;
                else beforeItem = movedItem;
                return (
                  <Fragment key={componentKey}>
                    {beforeItem}
                    {renderItem(componentKey, childIndex)}
                    {afterItem}
                  </Fragment>
                );
              } else {
                return renderItem(componentKey, childIndex);
              }
            })}
          </Accordion>
          <RaisedButton style={{ marginTop: "16px" }} onClick={this.handleAddClick.bind(this)} icon={<IconAdd />} />
        </Fragment>
      );
    }

    if (currentPath.startsWith(context.nodePath)) {
      return context.form.renderLevel({
        fields: field.fields,
        state: context.value[node.state[this.getIndexKey()]],
        parent: node
      });
    }

    return null;
  }
}

export default AccordionDynamic;
