import * as React from "react";
import { TextField, Checkbox } from "material-ui";
import { FormItem } from "../../../../../components/FormItem";

type GitSourceFormModel = {
  url?: string;
  autoSync?: boolean;
};

type GitSourceFormProps = {
  onFormChange: (model: GitSourceFormModel, valid: boolean) => void;
  model: GitSourceFormModel;
};

interface GitSourceFormState {}

export default class GitSourceForm extends React.Component<GitSourceFormProps, GitSourceFormState> {
  validateModel(model: GitSourceFormModel): { [key: string]: string } {
    const errors: any = {};
    if (model.url == null || model.url.trim().length === 0) {
      errors.url =
        "Repository URL - with credentials - is required. Sample: https://USER:PASSWORD@github.com/REPOSITORY.git";
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

  handleAutoSyncClick = (e: any) => {
    this.updateModel({ autoSync: !(this.props.model.autoSync ?? true) });
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
          <FormItem>
            <Checkbox label="Auto Sync" onClick={this.handleAutoSyncClick} checked={model.autoSync ?? true} />
          </FormItem>
        </FormItem>
      </React.Fragment>
    );
  }
}
