import * as React from "react";
import { TextField } from "material-ui";
import FolderPicker from "./../../../../../components/FolderPicker";
import { FormItem } from "../../../../../components/FormItem";

type FolderSourceFormModel = {
  folderPath: string;
  theme: string;
};

type FolderSourceFormProps = {
  onFormChange: (model: FolderSourceFormModel, valid: boolean) => void;
  model: FolderSourceFormModel;
};

type FolderSourceFormState = {};

export default class FolderSourceForm extends React.Component<FolderSourceFormProps, FolderSourceFormState> {
  validateModel(model: FolderSourceFormModel): { [key: string]: string } {
    const errors: any = {};
    if (model.folderPath == null || model.folderPath.trim().length === 0) {
      errors.folderPath = "Folder path is required.";
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

  handleRepoURLChange = (e: any, theme: string) => {
    this.updateModel({ theme });
  };

  render() {
    let { model = {} as any } = this.props;

    const errors = this.validateModel(model);

    return (
      <React.Fragment>
        <FormItem>
          <FolderPicker
            label={"Site Folder *"}
            selectedFolder={model.folderPath}
            errorText={errors.folderPath}
            onFolderSelected={this.handleFolderSelected}
          />
        </FormItem>
        <FormItem>
          <TextField
            floatingLabelFixed={true}
            value={model.theme || ""}
            onChange={this.handleRepoURLChange}
            errorText={errors.theme}
            fullWidth={true}
            floatingLabelText={"Theme Repository URL"}
          />
          <div><small>A Hugo theme repository URL. It only works if Git is installed on your computer and if the provided site folder is empty.</small></div>
        </FormItem>
      </React.Fragment>
    );
  }
}
