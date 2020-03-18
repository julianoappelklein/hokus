import React from "react";
import service from "./../services/service";
import { snackMessageService } from "./../services/ui-service";
import { HokusForm } from "./../components/HokusForm";
import Spinner from "./../components/Spinner";

import { WorkspaceConfig } from "./../types";

type CollectionItemProps = {
  siteKey: string;
  workspaceKey: string;
  collectionKey: string;
  collectionItemKey: string;
};

type CollectionItemState = {
  selectedWorkspaceDetails?: WorkspaceConfig;
  collectionItemValues?: any;
};

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {
  state: CollectionItemState = {};

  componentWillMount() {
    service.registerListener(this);
  }

  componentWillUnmount() {
    service.unregisterListener(this);
  }

  componentDidMount() {
    var stateUpdate: Partial<CollectionItemState> = {};
    var { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    Promise.all([
      service.api.getWorkspaceDetails(siteKey, workspaceKey).then(workspaceDetails => {
        stateUpdate.selectedWorkspaceDetails = workspaceDetails;
      }),
      service.api
        .getCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey)
        .then(collectionItemValues => {
          stateUpdate.collectionItemValues = collectionItemValues;
        })
    ]).then(() => {
      this.setState(stateUpdate as any);
    });
  }

  handleSave(context: any) {
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let promise = service.api.updateCollectionItem(
      siteKey,
      workspaceKey,
      collectionKey,
      collectionItemKey,
      context.data
    );
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
    if (this.state.collectionItemValues === undefined || this.state.selectedWorkspaceDetails == null) {
      return <Spinner />;
    }

    let { selectedWorkspaceDetails, collectionItemValues } = this.state;
    let { siteKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let collection = selectedWorkspaceDetails.collections.find(x => x.key === collectionKey);
    if (collection == null) return null;

    let fields = collection.fields.slice(0);
    fields.unshift({ key: "__item", type: "readonly", title: "Item" });

    let values = Object.assign({ __item: collectionItemKey }, this.state.collectionItemValues);

    return (
      <HokusForm
        rootName={collection.itemtitle || collection.title}
        fields={fields}
        values={values}
        plugins={{
          openBundleFileDialog: ({ title, extensions, targetPath }: any, onFilesReady: any) => {
            return service.api.openFileDialogForCollectionItem(
              siteKey,
              workspaceKey,
              collectionKey,
              collectionItemKey,
              targetPath,
              { title, extensions }
            );
          },
          getBundleThumbnailSrc: (targetPath: string) => {
            return service.api.getThumbnailForCollectionItemImage(
              siteKey,
              workspaceKey,
              collectionKey,
              collectionItemKey,
              targetPath
            );
          }
        }}
        onSave={this.handleSave.bind(this)}
      />
    );
  }
}

export default CollectionItem;
