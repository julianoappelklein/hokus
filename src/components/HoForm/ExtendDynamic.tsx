import * as React from "react";
import { BaseDynamic, CrawlContext } from "../HoForm";
import { FormStateBuilder } from "../HoForm/form-state-builder";
import { FieldBase, NormalizeStateContext, ExtendFieldContext } from "./types";

type ExtendDynamicField = {
  key: string;
  type: string;
  types: Array<FieldBase>;
  title: string;
  titleKey?: string | string[];
  fields: Array<any>;
  initialState?: { [key: string]: any };
  selectorKey: string;
  clearOnChange?: boolean | string[];
  clearExcept?: string[];
};

export class ExtendDynamic extends BaseDynamic<ExtendDynamicField, {}> {
  allocateStateLevel(field: ExtendDynamicField, parentState: any, rootState: any) {
    return parentState;
  }

  normalizeState({ state, field, stateBuilder }: NormalizeStateContext<ExtendDynamicField>) {
    stateBuilder.setLevelState(state, field.fields);
    this.checkStateSwitch(field, state, stateBuilder);
  }

  private getSelectedTypeField(
    field: ExtendDynamicField,
    state: any
  ): (FieldBase & { [key: string]: any }) | undefined {
    const selectorValue = state[field.selectorKey];
    const selectorValueStr = selectorValue != null ? selectorValue.toString() : "default";
    return field.types.find(x => x.key === selectorValueStr);
  }

  private checkStateSwitch(field: ExtendDynamicField, state: any, stateBuilder: FormStateBuilder): void {
    const selectedTypeField = this.getSelectedTypeField(field, state);
    const typeKey = selectedTypeField == null ? null : selectedTypeField.key;
    const lastNormalizedKey = `__lastNormalizedType:${field.selectorKey}`; //this is a hack
    const lastNormalizedValue = state[lastNormalizedKey];
    if (typeKey !== lastNormalizedValue) {
      if (lastNormalizedValue !== undefined) {
        let clear: Array<string> = [];
        const except = field.clearExcept || [];
        if (field.clearOnChange === true || field.clearOnChange == null) {
          clear = Object.keys(state);
        } else if (Array.isArray(field.clearOnChange)) {
          clear = field.clearOnChange;
        }
        clear.forEach(x => {
          if (x != field.selectorKey && except.indexOf(x) === -1) delete state[x];
        });
        if (selectedTypeField != null && selectedTypeField.initialState != null) {
          const initialState = selectedTypeField.initialState;
          Object.keys(initialState).forEach(key => {
            state[key] = (initialState as any)[key];
          });
        }
      }
      stateBuilder.setLevelState(state, field.fields);
      if (selectedTypeField) {
        stateBuilder.setLevelState(state, selectedTypeField.fields);
      }
      state[lastNormalizedKey] = typeKey;
    }
  }

  extendField({ field, extender }: ExtendFieldContext<ExtendDynamicField>): void {
    for (let i = 0; i < field.types.length; i++) {
      const type = field.types[i];
      if (type != null && type.fields != null) {
        extender.extendFields(type.fields);
      }
    }
    extender.extendFields(field.fields);
  }

  getType() {
    return "extend";
  }

  buildBreadcumbFragment(node: any, buttons: Array<{ label: string; node: any }>) {
    buttons.push({ label: this.getTitle(node.field, node.state), node });
  }

  buildDisplayPathFragment(node: any) {
    return node.field.key;
  }

  crawlComponent({ form, node }: CrawlContext<ExtendDynamicField>): void {
    const { field, state } = node;
    const parent = node.parent as any;
    this.checkStateSwitch(field, state, form.stateBuilder);
    form.crawlLevel({ fields: field.fields, state, parent });
    const selectedTypeField = this.getSelectedTypeField(field, state) as any;
    if (selectedTypeField) form.crawlLevel({ fields: selectedTypeField.fields, state, parent });
  }

  getTitle(field: ExtendDynamicField, state: any): string {
    let title = "";
    if (field.titleKey != null) {
      if (Array.isArray(field.titleKey)) {
        for (let i = 0; i < field.titleKey.length; i++) {
          const key = field.titleKey[i];
          title = (state[key] || "").toString();
          if (title) break;
        }
      } else {
        title = state[field.titleKey];
      }
    }
    if (title) return title;
    return field.title || "Unnamed";
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, nodePath, parentPath } = context;
    let { field } = node;

    if (currentPath.startsWith(parentPath)) {
      var state = node.state;
      const selectedTypeField = this.getSelectedTypeField(field, state);
      return (
        <React.Fragment>
          {context.form.renderLevel({ fields: field.fields, state, parent: node.parent as any })}
          {selectedTypeField &&
            context.form.renderLevel({ fields: selectedTypeField.fields || null, state, parent: node.parent as any })}
        </React.Fragment>
      );
    }

    return null;
  }
}
