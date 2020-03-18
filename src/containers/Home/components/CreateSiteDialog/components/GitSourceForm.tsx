import * as React from "react";
import { TextField } from "material-ui";
import FolderPicker from "./../../../../../components/FolderPicker";
import { FormItem } from "../../../../../components/FormItem";

type GitSourceFormModel = {
  folderPath: string;
  url: string;
};

type GitSourceFormProps = {
  onFormChange: (model: GitSourceFormModel, valid: boolean) => void;
  model: GitSourceFormModel;
};

type GitSourceFormState = {};

export default class GitSourceForm extends React.Component<GitSourceFormProps, GitSourceFormState> {
  validateModel(model: GitSourceFormModel): { [key: string]: string } {
    const errors: any = {};
    // if(model.folderPath==null||model.folderPath.trim().length===0){
    //     errors.folderPath = 'Website folder is required.';
    // }
    if (model.url == null || model.url.trim().length === 0) {
      errors.url = "Repository URL is required.";
    }
    return errors;
  }

  updateModel(modelUpdate: {}) {
    let data = Object.assign({}, this.props.model, modelUpdate);
    let valid = Object.keys(this.validateModel(data)).length === 0;
    this.props.onFormChange(data, valid);
  }

  handleFolderSelected = (folderPath: string | null) => {
    this.updateModel({ folderPath });
  };

  handleRepoURLChange = (e: any, url: string) => {
    this.updateModel({ url });
  };

  render() {
    let { model = {} as any } = this.props;
    const errors = this.validateModel(model);

    return (
      <React.Fragment>
        <FormItem>
          <TextField
            floatingLabelFixed={true}
            value={model.url || ""}
            errorText={errors.url}
            onChange={this.handleRepoURLChange}
            fullWidth={true}
            floatingLabelText={"Website Repository URL"}
          />
        </FormItem>
      </React.Fragment>
    );
  }
}
