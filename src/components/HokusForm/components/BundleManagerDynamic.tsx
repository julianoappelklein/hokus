import React from "react";
import IconUpload from "material-ui/svg-icons/file/file-upload";
import RaisedButton from "material-ui/RaisedButton";
import { Accordion, AccordionItem } from "../../Accordion";
import DangerButton from "../../DangerButton";
import FlatButton from "material-ui/FlatButton";
import IconRemove from "material-ui/svg-icons/content/clear";
import { ComponentContext, DynamicFormNode, FieldBase, ExtendFieldContext, CrawlContext } from "../../HoForm";
import { BaseDynamic } from "../../HoForm";
import { MuiTheme } from "material-ui/styles";
import MuiThemed from "../../MuiThemed";
import { hasValidationErrorInTree2 } from "../../HoForm/utils";

const regExtractExt = /[.]([^.]+)$/;
const extractExt = (file: string) => {
  return file.replace(regExtractExt, "$1");
};

type BundleManagerDynamicField = {
  key: string;
  type: string;
  fields: Array<any>;
  path: string;
  extensions: string[];
  title: string;
};

type BundleManagerDynamicState = {};

class BundleManagerDynamic extends BaseDynamic<BundleManagerDynamicField, BundleManagerDynamicState> {
  state: BundleManagerDynamicState = {};

  extendField({ field, extender }: ExtendFieldContext<BundleManagerDynamicField>): void {
    if (field.fields === undefined) field.fields = [];
    field.fields.unshift({ key: "src", type: "readonly", title: "Source File" });
    extender.extendFields(field.fields);
  }

  normalizeState({ state, field, stateBuilder }: { state: any; field: BundleManagerDynamicField; stateBuilder: any }) {
    if (!Array.isArray(state["resources"])) {
      state["resources"] = [];
    }
    for (let r = 0; r < state["resources"].length; r++) {
      let resource = state["resources"][r];
      if (
        resource.src.startsWith(field.path) &&
        (field.extensions || (field.extensions as string[]).indexOf(extractExt(resource.src.src)) != -1)
      ) {
        stateBuilder.setLevelState(resource, field.fields);
      }
    }
  }

  crawlComponent({ form, node }: CrawlContext<BundleManagerDynamicField>): void {
    let value = node.state.resources || [];
    for (let childIndex = 0; childIndex < value.length; childIndex++) {
      const state = value[childIndex];
      const { field } = node;
      form.crawlLevel({ fields: field.fields, state: state, parent: node });
    }
  }

  getType() {
    return "bundle-manager";
  }

  allocateStateLevel(field: BundleManagerDynamicField, parentState: any, rootState: any) {
    return rootState;
  }

  onButtonClick() {
    let { context } = this.props;
    let { field } = context.node;

    context.form.props.plugins
      .openBundleFileDialog({ title: field.title, extensions: field.extensions, targetPath: field.path })
      .then((files: string[]) => {
        if (files) {
          let currentFiles = context.value.slice();
          for (let f = 0; f < files.length; f++) {
            let file = files[f];
            let match = currentFiles.find((x: any) => x != null && x.src === file);
            if (match) {
              if (match.__deleted) delete match.__deleted;
            } else {
              currentFiles.push({ src: file });
            }
          }
          context.setValue(currentFiles);
        }
      });
  }

  removeItemWithValue(state: any) {
    state.__deleted = true;
    let { context } = this.props;
    context.setValue(context.value);
  }

  renderComponent() {
    return <MuiThemed render={this.renderComponentThemed} />;
  }

  buildDisplayPathFragment(node: any, nodeLevel: any, nodes: any) {
    return node.field.key;
  }

  renderComponentThemed = (theme: MuiTheme) => {
    let { context } = this.props;
    let { node, currentPath, parentPath, nodePath } = context;
    let { field } = node;

    if (!parentPath.startsWith(currentPath)) {
      return null;
    }

    let itemsStates = context.value.filter((x: any) => {
      return (
        x.src.startsWith(field.path) &&
        x.__deleted !== true &&
        (field.extensions || (field.extensions as string[]).indexOf(extractExt(x.src)) != -1)
      );
    });

    return (
      <React.Fragment>
        {field.title ? <div style={{ padding: "16px 0" }}>{field.title}</div> : undefined}
        <div
          style={{
            padding: "16px 16px 0px 16px",
            marginBottom: "16px",
            overflow: "auto",
            borderLeft: "solid 10px #eee"
          }}
        >
          <Accordion>
            {itemsStates.map((state: any, childIndex: number) => {
              let newNode = {
                fields: field.fields,
                state,
                parent: node
              };
              const hasError = hasValidationErrorInTree2(state, nodePath);
              const body = context.form.renderLevel(newNode);
              return (
                <AccordionItem
                  style={{ marginTop: childIndex ? "8px" : undefined }}
                  bodyStyle={{ padding: "16px 16px 0px 16px" }}
                  label={
                    <span style={{ color: hasError ? theme.textField?.errorColor : undefined }}>
                      {state.name || state.src}
                    </span>
                  }
                  key={field.key + "-resource-" + childIndex}
                  body={body}
                  headerRightItems={[
                    <DangerButton
                      onClick={(e, loaded) => {
                        e.stopPropagation();
                        if (loaded) {
                          this.removeItemWithValue(state);
                        }
                      }}
                      loadedButton={<FlatButton secondary={true} style={{ minWidth: 40 }} icon={<IconRemove />} />}
                      button={<FlatButton style={{ minWidth: 40 }} icon={<IconRemove opacity={0.3} />} />}
                    />
                  ]}
                />
              );
            })}
          </Accordion>
          <RaisedButton
            style={{ marginBottom: "16px", marginTop: itemsStates.length ? "16px" : undefined }}
            onClick={this.onButtonClick.bind(this)}
            icon={<IconUpload />}
          />
        </div>
      </React.Fragment>
    );
  };

  getValue(context: ComponentContext<BundleManagerDynamicField>) {
    return context.node.state["resources"].slice(0);
  }
  setValue(context: ComponentContext<BundleManagerDynamicField>, value: any) {
    context.node.state["resources"] = value;
  }
  clearValue(context: ComponentContext<BundleManagerDynamicField>) {
    delete context.node.state["resources"];
  }
}

export default BundleManagerDynamic;
