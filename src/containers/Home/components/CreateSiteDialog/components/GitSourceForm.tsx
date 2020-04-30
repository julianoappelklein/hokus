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
        "Repository URL is required.";
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
          <p style={{position: "relative", top:"-1rem"}}><small>You can use a URL with credentials - https://USR:PSWD@github.com/REPO.git - OR use a SSH address - git@github.com:REPO.git".</small></p>
          <FormItem>
            <Checkbox label="Auto Sync" onClick={this.handleAutoSyncClick} checked={model.autoSync ?? true} />
            <p><small>Keep this checked if you to send and receive updates. Be aware that changes may trigger a CI/CD pipeline.</small></p>
          </FormItem>
        </FormItem>
      </React.Fragment>
    );
  }
}
