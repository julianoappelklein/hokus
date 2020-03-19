import * as React from "react";
import { ListItem } from "material-ui/List";
import IconChevronRight from "material-ui/svg-icons/navigation/chevron-right";
import IconFileFolder from "material-ui/svg-icons/file/folder";
import { BaseDynamic, CrawlContext, NormalizeStateContext, ExtendFieldContext } from "../../HoForm";

type NestDynamicField = {
  key: string;
  type: string;
  title: string;
  fields: Array<any>;
  groupdata?: boolean;
};

class NestDynamic extends BaseDynamic<NestDynamicField, {}> {
  allocateStateLevel(field: NestDynamicField, parentState: any, rootState: any) {
    if (field.groupdata == null || field.groupdata === true) {
      if (
        parentState[field.key] == null ||
        typeof parentState[field.key] !== "object" ||
        Array.isArray(parentState[field.key])
      ) {
        parentState[field.key] = {};
      }
      return parentState[field.key];
    }
    return parentState;
  }

  normalizeState({ state, field, stateBuilder }: NormalizeStateContext<NestDynamicField>) {
    stateBuilder.setLevelState(state, field.fields);
  }

  extendField({ field, extender }: ExtendFieldContext<NestDynamicField>): void {
    if (field.groupdata == null) field.groupdata = true;
    extender.extendFields(field.fields);
  }

  getType() {
    return "nest";
  }

  buildBreadcumbFragment(node: any, buttons: Array<{ label: string; node: any }>) {
    buttons.push({ label: node.field.title, node });
  }

  buildDisplayPathFragment(node: any) {
    if (node.field.groupdata === false) {
      return `${node.field.key}`;
    }
    return node.field.key;
  }

  crawlComponent({ form, node }: CrawlContext<NestDynamicField>): void {
    const { field, state } = node;
    form.crawlLevel({ fields: field.fields, state, parent: node });
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, nodePath, parentPath } = context;
    let { field } = node;

    if (currentPath === parentPath) {
      //const hasErrors = hasValidationErrorInTree2(node.state, nodePath);

      return (
        <ListItem
          style={{ border: "solid 1px #eee", margin: "3px 0" }}
          leftIcon={<IconFileFolder />}
          rightIcon={<IconChevronRight />}
          onClick={function() {
            context.setPath(node);
          }}
          primaryText={field.title}
        ></ListItem>
      );
    }

    if (currentPath.startsWith(nodePath)) {
      var state = node.state;
      return context.form.renderLevel({ fields: field.fields, state, parent: node });
    }

    return null;
  }
}

export default NestDynamic;
