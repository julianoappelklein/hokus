import * as React from "react";
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from "material-ui";
import FolderSourceForm from "./components/FolderSourceForm";
import GitSourceForm from "./components/GitSourceForm";
import { FormItem } from "../../../../components/FormItem";
import service from "../../../../services/service"; //not cool

type CreateSiteDialogProps = {
  open: boolean;
  onCancelClick: () => void;
  onSubmitClick: (model: any) => Promise<boolean>;
};

type CreateSiteDialogState = {
  formIsValid: boolean;
  model: any;
  sourceIndex: number;
  key: string;
  dependencies?: Array<{ program: string; exists: boolean }> | null;
};

function NotImplementedSourceForm() {
  return <p>This feature is not implemented yet.</p>;
}

const SITE_SOURCES = [
  { key: "folder", title: "Folder", enabled: true, form: FolderSourceForm, description: "" },
  { key: "git", title: "Git (Beta)", enabled: true, form: GitSourceForm, description: "" },
  { key: "ftp", title: "FTP", enabled: false, form: NotImplementedSourceForm, description: "" },
  { key: "aws-s3", title: "AWS S3", enabled: false, form: NotImplementedSourceForm, description: "" }
];

const INITIAL_STATE = {
  formIsValid: false,
  model: {},
  sourceIndex: -1,
  key: ""
};

const VALID_KEY = /[^a-z0-9_-]/;

export default class CreateSiteDialog extends React.Component<CreateSiteDialogProps, CreateSiteDialogState> {
  constructor(props: CreateSiteDialogProps) {
    super(props);

    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  handleFormChange = (model: any, valid: boolean) => {
    this.setState({ model, formIsValid: valid });
  };

  handleCancelClick = () => {
    this.setState(JSON.parse(JSON.stringify(INITIAL_STATE)));
    this.props.onCancelClick();
  };

  handleSubmitClick = async () => {
    let data = Object.assign({}, JSON.parse(JSON.stringify(this.state.model)), {
      type: SITE_SOURCES[this.state.sourceIndex].key,
      key: this.state.key
    });
    if (await this.props.onSubmitClick(data)) {
      this.setState(JSON.parse(JSON.stringify(INITIAL_STATE)));
    }
  };

  handleSourceChange = async (e: any, index: number) => {
    this.setState({ sourceIndex: index, formIsValid: false, dependencies: null });
    const dependencies = (await service.api.getSiteSourceDependencyStatus(SITE_SOURCES[index].key)) || [];
    this.setState({ dependencies });
  };

  handleKeyChange = (e: any, value: string) => {
    this.setState({ key: value });
  };

  validate(): any {
    let { formIsValid, sourceIndex, key } = this.state;
    let source = SITE_SOURCES[sourceIndex];
    const errors: any = {};

    if (source == null) {
      errors.source = "Source Type is required.";
    } else {
      if (!source.enabled) {
        errors.source = "Source not allowed.";
      }
    }
    if (key.length === 0 || VALID_KEY.test(key)) {
      errors.key = 'Key is required. Only lowercase letters, numbers, "-" and "_" are allowed.';
    }

    const invalidDependencies = (this.state.dependencies || []).filter(x => x.exists === false).map(x => x.program);
    if (invalidDependencies.length > 0) {
      errors.dependencies = `To use this site source, the following dependencies must be installed on your computer: ${invalidDependencies.join(
        ", "
      )}.`;
    }

    return errors;
  }

  render() {
    let { open } = this.props;
    let { model, sourceIndex, key } = this.state;
    let source = SITE_SOURCES[sourceIndex];
    let SourceForm: any = source && source.enabled ? source.form : null;

    let errors = this.validate();
    const valid = Object.keys(errors).length === 0;

    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleCancelClick} />,
      <FlatButton disabled={!valid} label="Submit" primary={true} onClick={this.handleSubmitClick} />
    ];

    return (
      <Dialog title="New Site" open={open} contentStyle={{ maxWidth: 500 }} actions={actions}>
        <FormItem>
          <TextField
            floatingLabelText="Key *"
            floatingLabelFixed={true}
            fullWidth={true}
            value={key}
            errorText={errors.key}
            onChange={this.handleKeyChange}
          />
        </FormItem>
        <FormItem>
          <SelectField
            onChange={this.handleSourceChange}
            fullWidth
            errorText={errors.source || errors.dependencies}
            value={sourceIndex}
            floatingLabelText="Source Type *"
          >
            {SITE_SOURCES.map((s, i) => (
              <MenuItem key={s.key} value={i} primaryText={`${s.title}${s.enabled ? "" : " - Not Implemented"}`} />
            ))}
          </SelectField>
        </FormItem>
        {SourceForm ? <SourceForm model={model} onFormChange={this.handleFormChange} /> : null}
      </Dialog>
    );
  }
}
