import * as React from "react";
import { HoForm, ComponentRegistry } from "./../../components/HoForm";
import dynamicFormComponents from "./../../components/HokusForm/components/all";
import { FormBreadcumb } from "./../../components/Breadcumb";
import { HokusForm } from "../../components/HokusForm";

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
    const includes = {
      fieldsAccordionInclude: [
        {
          key: "fields",
          type: "accordion",
          title: "fields",
          itemTitleKey: "key",
          fields: [{ key: "anyFieldInclude", type: "include", include: "anyFieldInclude" }]
        }
      ],
      anyFieldInclude: [
        { key: "baseFieldInclude", type: "include", include: "baseFieldInclude" },
        {
          key: "type",
          title: "type",
          type: "select",
          options: [
            { value: "accordion" },
            { value: "boolean" },
            { value: "bundle-manager" },
            { value: "chips" },
            { value: "date" },
            { value: "empty-line" },
            { value: "info" },
            { value: "nest" },
            { value: "number" },
            { value: "select" },
            { value: "string" }
          ],
          default: "string",
          required: true
        },
        {
          key: "typeExtender",
          type: "extend",
          nest: false,
          groupdata: false,
          selectorKey: "type",
          fields: [],
          clearExcept: ["key"],
          types: [
            { key: "accordion", fields: [{ key: "accordionInclude", type: "include", include: "accordionInclude" }] },
            { key: "boolean", fields: [{ key: "booleanInclude", type: "include", include: "booleanInclude" }] },
            {
              key: "bundle-manager",
              fields: [{ key: "bundleManagerInclude", type: "include", include: "bundleManagerInclude" }]
            },
            { key: "chips", fields: [{ key: "chipsInclude", type: "include", include: "chipsInclude" }] },
            { key: "date", fields: [{ key: "dateInclude", type: "include", include: "dateInclude" }] },
            { key: "empty-line", fields: [{ key: "emptyLineInclude", type: "include", include: "emptyLineInclude" }] },
            { key: "info", fields: [{ key: "infoInclude", type: "include", include: "infoInclude" }] },
            { key: "number", fields: [{ key: "numberInclude", type: "include", include: "numberInclude" }] },
            { key: "nest", fields: [{ key: "nestInclude", type: "include", include: "nestInclude" }] },
            { key: "string", fields: [{ key: "textFieldInclude", type: "include", include: "textFieldInclude" }] },
            { key: "select", fields: [{ key: "selectInclude", type: "include", include: "selectInclude" }] }
          ]
        }
      ],
      baseFieldInclude: [{ key: "key", type: "string", title: "key", required: true }],
      accordionInclude: [
        { key: "title", title: "title", type: "string", required: true },
        { key: "itemTitleKey", title: "itemTitleKey", type: "string" },
        { key: "itemTitleFallbackKey", title: "itemTitleFallbackKey", type: "string" },
        { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
      ],
      booleanInclude: [
        { key: "title", title: "title", type: "string", required: true },
        { key: "default", title: "default", type: "boolean", default: false },
        { key: "tip", title: "tip", type: "string" }
      ],
      bundleManagerInclude: [
        { key: "title", title: "title", type: "string", required: true },
        { key: "path", title: "path", type: "string" },
        {
          key: "extensions",
          title: "extensions",
          type: "leaf-array",
          field: {
            key: "item",
            type: "string",
            required: true
          }
        },
        { key: "default", title: "default", type: "boolean", default: false },
        { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
      ],
      chipsInclude: [
        { key: "title", title: "title", type: "string", required: true },
        { key: "default", title: "default", type: "chips" }
      ],
      dateInclude: [
        { key: "title", title: "title", type: "string", required: true },
        // { key: "required", title: "required", type: "boolean", default: false },
        { key: "default", title: "default", type: "date" },
        { key: "tip", title: "tip", type: "string" }
      ],
      emptyLineInclude: [{ key: "amount", title: "amount", type: "number" }],
      infoInclude: [
        { key: "content", title: "content", type: "markdown", multiLine: true },
        {
          key: "size", title: "size", type: "select", default: "default",
          options: [
            { value: "small" },
            { value: "default" },
            { value: "large" },
          ]
        },
        { key: "lineHeight", title: "lineHeight", type: "number", default: 1.2 },
        {
          key: "theme",
          title: "theme",
          type: "select",
          default: "default",
          options: [
            { value: "default" },
            { value: "bare" },
            { value: "warn" },
            { value: "warn-bare" },
            { value: "black" },
            { value: "black-bare" },
            { value: "gray" },
            { value: "gray-bare" }
          ]
        }
      ],
      nestInclude: [
        { key: "title", title: "title", type: "string", required: true },
        { key: "default", title: "default", type: "boolean", default: false },
        { key: "groupdata", title: "groupdata", type: "boolean", default: false },
        { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
      ],
      numberInclude: [
        { key: "title", title: "title", type: "string", required: true },
        // { key: "required", title: "required", type: "boolean", default: false },
        { key: "default", title: "default", type: "number" },
        { key: "tip", title: "tip", type: "string" }
      ],
      textFieldInclude: [
        { key: "title", title: "title", type: "string", required: true },
        { key: "required", title: "required", type: "boolean", default: false },
        { key: "default", title: "default", type: "string" },
        { key: "pattern", title: "pattern", type: "string", required: false },
        { key: "multiline", title: "multiline", type: "boolean", default: false },
        { key: "tip", title: "tip", type: "string" }
      ],
      selectInclude: [
        { key: "title", title: "title", type: "string", required: true },
        {
          key: "options",
          title: "options",
          type: "accordion",
          itemTitleKey: "value",
          fields: [
            { key: "value", title: "value", type: "string" },
            { key: "text", title: "text", type: "string" }
          ]
        },
        { key: "multiple", title: "multiple", type: "boolean", default: false },
        { key: "required", title: "required", type: "boolean", default: false },
        {
          key: "multipleExtend",
          selectorKey: "multiple",
          type: "extend",
          clearOnChange: ["default"],
          types: [
            {
              key: "false",
              fields: [{ key: "default", title: "default", type: "string", default: "" }]
            },
            {
              key: "true",
              fields: [
                {
                  key: "default",
                  title: "default",
                  type: "leaf-array",
                  field: { key: "value", title: "Value", type: "string" },
                  default: []
                }
              ]
            }
          ]
        },
        { key: "tip", title: "tip", type: "string" }
      ]
    };

    return (
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1", position: "relative" }}>
          <HokusForm
            onSave={this.handleSave}
            rootName={"Form Builder"}
            includes={includes}
            ref={this.handleFormRef}
            fields={[{ key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }]}
            values={{}}
            plugins={{
              openBundleFileDialog: function ({ title, extensions, targetPath }: any, onFilesReady: any) {
                alert("This operation is not supported in the Cookbook. But we'll mock something for you.");
                return Promise.resolve([`${targetPath}/some-file.${extensions[0] || "png"}`]);
              },
              getBundleThumbnailSrc: function (targetPath: string) {
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
            includes={includes}
            ref={this.handleFormRef}
            breadcumbComponentType={FormBreadcumb}
            fields={this.state.form?.fields || []}
            debug={false}
            componentRegistry={componentRegistry}
            values={{}}
            plugins={{
              openBundleFileDialog: function ({ title, extensions, targetPath }: any, onFilesReady: any) {
                alert("This operation is not supported in the FormBuilder. But we'll mock something for you.");
                return Promise.resolve([`${targetPath}/some-file.${extensions[0] || "png"}`]);
              },
              getBundleThumbnailSrc: function (targetPath: string) {
                return Promise.resolve(
                  "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
                );
              }
            }}
          />
        </div>
      </div>
    );
  }
}
