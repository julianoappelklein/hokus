import * as React from "react";
import { TextField, RaisedButton } from "material-ui";

type FolderPickerProps = {
  onFolderSelected: (folder: string | null) => void;
  selectedFolder: string | null | undefined;
  label: string;
  errorText?: string;
};

type FolderPickerState = {};

export default class FolderPicker extends React.Component<FolderPickerProps, FolderPickerState> {
  handlePickFileClick() {
    this.openPicker();
  }

  handleTextFieldClick() {
    this.openPicker();
  }

  openPicker() {
    let { remote } = window.require("electron");
    remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        properties: ["openDirectory"]
      },
      (result: any) => {
        let selectedFolder = (result || [])[0];
        this.props.onFolderSelected(selectedFolder || null);
      }
    );
  }

  render() {
    let { selectedFolder, label } = this.props;

    return (
      <div style={{ display: "flex" }}>
        <TextField
          fullWidth
          value={selectedFolder || ""}
          floatingLabelText={label}
          floatingLabelFixed
          errorText={this.props.errorText}
          style={{ flex: "1" }}
          {...({ onClick: this.handleTextFieldClick.bind(this) } as any)}
        />
        <RaisedButton
          onClick={this.handlePickFileClick.bind(this)}
          style={{ flex: "140px 0 0", alignSelf: "flex-end", marginLeft: "8px", marginBottom: "8px" }}
          label="Pick Folder"
        />
      </div>
    );
  }
}
