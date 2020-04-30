import * as React from "react";
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from "material-ui";

interface Props {
  unmounteWorkspaces: string[];
  open: boolean;
  onClose?: () => void;
  onSubmit?: (workspaceKey: string) => void;
}

interface State {
  unmountedWorkspaceKey: string;
  newWorkspaceKey: string;
}

export default class AddWorkspaceDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      unmountedWorkspaceKey: "",
      newWorkspaceKey: ""
    };
  }

  validate() {
    const workspaceKey = this.state.unmountedWorkspaceKey || this.state.newWorkspaceKey;
    return workspaceKey;
  }

  handleCloseClick = () => {
    this.props.onClose && this.props.onClose();
  };

  handleAddClick = () => {
    this.props.onSubmit && this.props.onSubmit(this.state.newWorkspaceKey || this.state.unmountedWorkspaceKey);
    this.props.onClose && this.props.onClose();
    this.setState({ unmountedWorkspaceKey: "", newWorkspaceKey: "" });
  };

  render() {
    let { open, unmounteWorkspaces } = this.props;
    let { unmountedWorkspaceKey, newWorkspaceKey } = this.state;

    let valid = this.validate();

    const actions = [
      <FlatButton label="Cancel" primary={false} onClick={this.handleCloseClick} />,
      <FlatButton disabled={!valid} label="Add" primary={true} onClick={this.handleAddClick} />
    ];

    return (
      <Dialog
        contentStyle={{ maxWidth: "600px" }}
        title="Add Workspace"
        open={open}
        actions={actions}
        onRequestClose={this.handleCloseClick}
      >
        <TextField
          disabled={unmountedWorkspaceKey.length > 0}
          floatingLabelText={"New Workspace"}
          fullWidth
          onChange={(e, newWorkspaceKey) => this.setState({ newWorkspaceKey })}
          value={newWorkspaceKey}
        />

        {unmounteWorkspaces.length > 0 && (
          <React.Fragment>
            <div style={{ margin: "2rem 0 0 0", textAlign: "center", fontSize: "120%" }}>OR</div>

            <SelectField
              disabled={newWorkspaceKey.length > 0}
              onChange={(e, index) => this.setState({ unmountedWorkspaceKey: unmounteWorkspaces[index] })}
              fullWidth
              value={unmountedWorkspaceKey}
              floatingLabelText="Unmounted Workspace"
            >
              {unmounteWorkspaces.map((key, i) => (
                <MenuItem key={`publish-${key}`} value={key} primaryText={key} />
              ))}
            </SelectField>
          </React.Fragment>
        )}
      </Dialog>
    );
  }
}
