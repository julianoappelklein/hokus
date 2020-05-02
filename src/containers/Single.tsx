import React from "react";
import service from "./../services/service";
import { snackMessageService } from "./../services/ui-service";
import { HokusForm } from "./../components/HokusForm";
import Spinner from "./../components/Spinner";
import { WorkspaceConfig, SingleConfig } from "./../types";

type SingleProps = {
  siteKey: string;
  workspaceKey: string;
  singleKey: string;
};

type SingleState = {
  selectedWorkspaceDetails?: WorkspaceConfig;
  single?: SingleConfig;
  singleValues: any;
};

class Single extends React.Component<SingleProps, SingleState> {
  constructor(props: SingleProps) {
    super(props);
    this.state = {
      singleValues: null
    };
  }
  componentWillMount() {
    service.registerListener(this);
  }

  componentDidMount() {
    let stateUpdate: Partial<SingleState> = {};
    const { siteKey, workspaceKey, singleKey } = this.props;

    Promise.all([
      service.api.getSingle(siteKey, workspaceKey, singleKey).then(single => {
        stateUpdate.singleValues = single;
      }),
      service.api.getWorkspaceDetails(siteKey, workspaceKey).then(workspaceDetails => {
        stateUpdate.selectedWorkspaceDetails = workspaceDetails;
      })
    ])
      .then(() => {
        this.setState(stateUpdate as any);
      })
      .catch(e => {});
  }

  componentWillUnmount() {
    service.unregisterListener(this);
  }

  handleSave(context: any) {
    const { siteKey, workspaceKey, singleKey } = this.props;

    let promise = service.api.updateSingle(siteKey, workspaceKey, singleKey, context.data);
    promise.then(
      function(updatedValues) {
        snackMessageService.addSnackMessage("Document saved successfully.");
        context.accept(updatedValues);
      },
      function() {
        context.reject("Something went wrong.");
      }
    );
  }

  render() {
    let { siteKey, workspaceKey, singleKey } = this.props;

    if (this.state.singleValues === undefined || this.state.selectedWorkspaceDetails == null) {
      return <Spinner />;
    }
    let single = this.state.selectedWorkspaceDetails.singles.find(x => x.key === this.props.singleKey);
    if (single == null) return null;

    return (
      <HokusForm
        rootName={single.title}
        fields={single.fields}
        values={this.state.singleValues}
        onSave={this.handleSave.bind(this)}
        plugins={{
          openBundleFileDialog: ({ title, extensions, targetPath }: any, onFilesReady: any) => {
            return service.api.openFileDialogForSingle(siteKey, workspaceKey, singleKey, targetPath, {
              title,
              extensions
            });
          },
          getBundleThumbnailSrc: (targetPath: string) => {
            return service.api.getThumbnailForSingleImage(siteKey, workspaceKey, singleKey, targetPath);
          }
        }}
      />
    );
  }
}

export default Single;
