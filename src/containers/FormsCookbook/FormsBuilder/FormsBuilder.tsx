import * as React from "react";
import { HoForm, ComponentRegistry } from "./../../../components/HoForm";
import { MultiFormatDataDisplay } from "./../../../components/MultiFormatDataDisplay";
import dynamicFormComponents from "./../../../components/HokusForm/components/all";
import { FormBreadcumb } from "./../../../components/Breadcumb";
import { HokusForm } from "../../../components/HokusForm";
import { Tabs, Tab } from "material-ui";
import { formConfigurationsIncludes } from "../../../utils/configurations-includes";

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

type FormsBuilderProps = {};
type FormsBuilderState = {
  form: any;
  formKey: number;
};

export class FormsBuilder extends React.Component<FormsBuilderProps, FormsBuilderState> {
  formRef: any;
  state: FormsBuilderState = {
    form: {},
    formKey: 1
  };

  constructor(props: FormsBuilderProps) {
    super(props);
  }

  handleFormRef = (ref: any) => {
    this.formRef = ref;
  };

  handleSave = (arg1: { data: any; accept: any; reject: any }) => {
    this.setState({ form: arg1.data, formKey: ++this.state.formKey });
    arg1.accept();
  };

  render() {
    const fields = this.state.form?.fields || [];

    return (
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1", position: "relative" }}>
          <HokusForm
            onSave={this.handleSave}
            rootName={"Form Builder"}
            includes={formConfigurationsIncludes}
            ref={this.handleFormRef}
            fields={[{ key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }]}
            values={{}}
            plugins={{
              openBundleFileDialog: function({ title, extensions, targetPath }: any, onFilesReady: any) {
                alert("This operation is not supported in the Cookbook. But we'll mock something for you.");
                return Promise.resolve([`${targetPath}/some-file.${extensions[0] || "png"}`]);
              },
              getBundleThumbnailSrc: function(targetPath: string) {
                return Promise.resolve(
                  "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
                );
              }
            }}
          />
        </div>
        <div style={{ padding: "1rem", flex: "1" }}>
          <HoForm
            key={this.state.formKey}
            rootName={"Resulting Form"}
            includes={formConfigurationsIncludes}
            ref={this.handleFormRef}
            breadcumbComponentType={FormBreadcumb}
            fields={
              fields.length === 0
                ? [
                    {
                      key: "emptyInfo",
                      content: "Your form is empty. Add fields to it to see a preview.",
                      type: "info"
                    }
                  ]
                : fields
            }
            debug={true}
            componentRegistry={componentRegistry}
            values={{}}
            plugins={{
              openBundleFileDialog: function({ title, extensions, targetPath }: any, onFilesReady: any) {
                alert("This operation is not supported in the FormBuilder. But we'll mock something for you.");
                return Promise.resolve([`${targetPath}/some-file.${extensions[0] || "png"}`]);
              },
              getBundleThumbnailSrc: function(targetPath: string) {
                return Promise.resolve(
                  "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
                );
              }
            }}
          />
          <br />
          <MultiFormatDataDisplay data={{ fields }} />
        </div>
      </div>
    );
  }
}
