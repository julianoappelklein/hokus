import * as React from "react";
import { samples } from "./samples";
import { HoForm, ComponentRegistry } from "./../../components/HoForm";
import dynamicFormComponents from "./../../components/HokusForm/components/all";
import { FormBreadcumb } from "./../../components/Breadcumb";
import { Dialog, RaisedButton } from "material-ui";

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

type FormsCookbookProps = {
  sampleKey: any;
  samples?: Array<any>;
};

type FormsCookbookState = {
  modal: null | "config" | "state";
};

interface MenuBarProps {
  onViewStateClick: () => void;
  onViewConfigClick: () => void;
}

const MenuBar = (props: MenuBarProps) => {
  return (
    <div
      style={{
        background: "white",
        position: "fixed",
        bottom: 0,
        right: "32px",
        padding: "16px",
        zIndex: 10,
        boxShadow: "0px 1px 5px RGBA(0,0,0,.3)"
      }}
    >
      <RaisedButton onClick={props.onViewConfigClick} label="View Config" />
      <span> </span>
      <RaisedButton onClick={props.onViewStateClick} label="View State" />
    </div>
  );
};

export class FormsCookbook extends React.Component<FormsCookbookProps, FormsCookbookState> {
  formRef: any;

  constructor(props: FormsCookbookProps) {
    super(props);
    this.state = { modal: null };
  }

  handleOnViewStateClick = () => {
    this.setState({ modal: "state" });
  };

  handleOnViewConfigClick = () => {
    this.setState({ modal: "config" });
  };

  handleModalClose = () => {
    this.setState({ modal: null });
  };

  handleFormRef = (ref: any) => {
    this.formRef = ref;
  };

  render() {
    let { sampleKey } = this.props;
    let sample = (this.props.samples || samples).find(x => x.key === sampleKey);
    if (sample) {
      return (
        <div style={{ padding: "1rem" }}>
          <HoForm
            includes={{}}
            ref={this.handleFormRef}
            key={sampleKey}
            rootName={sample.title}
            breadcumbComponentType={FormBreadcumb}
            fields={sample.fields}
            debug={false}
            componentRegistry={componentRegistry}
            values={sample.values}
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
          <MenuBar onViewConfigClick={this.handleOnViewConfigClick} onViewStateClick={this.handleOnViewStateClick} />
          <div style={{ height: "70px" }} />
          <Dialog
            title="State"
            modal={false}
            open={this.state.modal === "state"}
            autoScrollBodyContent={true}
            onRequestClose={this.handleModalClose}
          >
            {this.state.modal === "state" ? (
              <pre>{JSON.stringify(this.formRef.getFormDocClone(), null, " ")}</pre>
            ) : null}
          </Dialog>
          <Dialog
            title="Config"
            modal={false}
            open={this.state.modal === "config"}
            autoScrollBodyContent={true}
            onRequestClose={this.handleModalClose}
          >
            {this.state.modal === "config" ? <pre>{JSON.stringify(sample.fields, null, " ")}</pre> : null}
          </Dialog>
        </div>
      );
    }
    return <p>Sample not found.</p>;
  }
}
