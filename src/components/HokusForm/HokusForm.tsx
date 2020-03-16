import React from "react";
import { FloatingActionButton } from "material-ui";
import { FormBreadcumb } from "../Breadcumb";
import IconCheck from "material-ui/svg-icons/navigation/check";
import dynamicFormComponents from "./components/all";
import { ComponentRegistry } from "../HoForm/component-registry";
import { HoForm } from "../HoForm/";

const componentRegistry = new ComponentRegistry(dynamicFormComponents);

type HokusFormProps = {
  onSave: (arg0: { data: any; accept: any; reject: any }) => void;
  fields: any;
  plugins: {
    [key: string]: Function;
  };
  rootName: string;
  values: {};
};

type HokusFormState = {
  changed: boolean;
  error?: string;
  savedOnce: boolean;
};

export class HokusForm extends React.Component<HokusFormProps, HokusFormState> {
  _valueFactory: () => any = () => {};

  constructor(props: HokusFormProps) {
    super(props);
    this.state = {
      changed: false,
      savedOnce: false
    };
  }

  keydownHandler(e: any) {
    e = e || window.event;
    var keyCode = e.keyCode || e.which;

    if (e.ctrlKey && keyCode === 83) {
      if (this.state.changed) {
        this.saveContent();
      }
      return;
    }
  }

  componentWillMount() {
    document.addEventListener("keydown", this.keydownHandler.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keydownHandler);
  }

  saveContent() {
    if (this.props.onSave) {
      var context = {
        accept: (updatedValues: any) => {
          //this is a rule dependency that must be resolved in the "server" and the changes must be merged in the document
          // if(this.state.document.resources){
          //     this.state.document.resources = this.state.document.resources.filter(x => !x.__deleted===true);
          // }

          this.setState({
            changed: false,
            savedOnce: true
            //document:updatedValues,   //THIS IS A BAD IDEA! BAD WAY TO APPLY CHANGES FROM A SERVER
            //THE FORM WILL HAVE PROBLEMS. WE MUST UPDATE THE DOCUMENT, NOT REPLACE IT
            //THE DOC - AGAINST ALL RECOMMENDATIONS - IS MUTABLE
            // WE MUST FIND A WAY TO UPDATE THIS WITHOUT REPLACING IT
          });
        },
        reject: (msg: string) => {
          this.setState({ error: msg || "Error" });
        },
        data: Object.assign({}, this._valueFactory())
      };
      let updatedValues = this.props.onSave.call(this, context);
    } else {
      this.setState({ error: "Save not implemented" });
    }
  }

  handleFormChange(valueFactory: () => any) {
    this._valueFactory = valueFactory;
    if (!this.state.changed) {
      this.setState({ changed: true });
    }
  }

  render() {
    let floatingActionButtonClass = "animated";
    if (!this.state.savedOnce) floatingActionButtonClass += " zoomIn";
    if (this.state.changed) floatingActionButtonClass += " rubberBand";

    return (
      <div style={{padding: '1rem'}}>
        <HoForm
          includes={{}}
          debug={false}
          breadcumbComponentType={FormBreadcumb}
          componentRegistry={componentRegistry}
          fields={this.props.fields}
          plugins={this.props.plugins}
          rootName={this.props.rootName}
          values={this.props.values}
          onChange={this.handleFormChange.bind(this)}
        />
        <FloatingActionButton
          style={{
            position: "fixed",
            right: 40,
            bottom: "20px",
            zIndex: 3
          }}
          className={floatingActionButtonClass}
          disabled={!this.state.changed}
          onClick={() => this.saveContent()}
        >
          <IconCheck />
        </FloatingActionButton>
        <div style={{ height: "70px" }}></div>
      </div>
    );
  }
}
