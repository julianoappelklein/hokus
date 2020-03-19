import * as React from "react";
import { Breadcumb, BreadcumbItem } from "./../components/Breadcumb";
import { Route } from "react-router-dom";
import service from "./../services/service";
import Spinner from "./../components/Spinner";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import {
  Chip,
  Divider,
  Dialog,
  FlatButton,
  IconButton,
  IconMenu,
  List,
  ListItem,
  MenuItem,
  Paper,
  RaisedButton,
  TextField
} from "material-ui";
import { Debounce } from "./../utils/debounce";
import { WorkspaceConfig } from "../../global-types";

const Fragment = React.Fragment;

const MAX_RECORDS = 200;

type DeleteItemKeyDialogProps = {
  busy: boolean;
  itemLabel: string;
  handleClose: () => void;
  handleConfirm: (key: string) => void;
};

type DeleteItemKeyDialogState = {
  value: string;
  valid?: boolean;
};

class DeleteItemKeyDialog extends React.Component<DeleteItemKeyDialogProps, DeleteItemKeyDialogState> {
  constructor(props: DeleteItemKeyDialogProps) {
    super(props);
    this.state = {
      value: ""
    };
  }

  handleClose() {
    if (this.props.handleClose && !this.props.busy) this.props.handleClose();
  }

  handleConfirm() {
    if (this.props.handleConfirm) this.props.handleConfirm(this.state.value);
  }

  render() {
    let { busy, itemLabel } = this.props;

    return (
      <Dialog
        title={"Delete Item"}
        modal={true}
        open={true}
        onRequestClose={this.handleClose}
        actions={[
          <FlatButton disabled={busy} primary={true} label="Cancel" onClick={this.handleClose.bind(this)} />,
          <FlatButton disabled={busy} primary={true} label="Delete" onClick={this.handleConfirm.bind(this)} />
        ]}
      >
        {this.state.valid ? (
          undefined
        ) : (
          <p>
            Do you really want to delete the item <b>"{itemLabel}"</b>?
          </p>
        )}

        {busy ? <Spinner /> : undefined}
      </Dialog>
    );
  }
}

type EditItemKeyDialogProps = {
  busy: boolean;
  value?: string;
  title?: string;
  confirmLabel: string;
  handleClose: () => void;
  handleConfirm: (value: string, initialValue: string) => void;
};

type EditItemKeyDialogState = {
  value: string;
  initialValue: string;
  valid?: boolean;
};

class EditItemKeyDialog extends React.Component<EditItemKeyDialogProps, EditItemKeyDialogState> {
  constructor(props: EditItemKeyDialogProps) {
    super(props);
    this.state = {
      value: props.value || "",
      initialValue: props.value || ""
    };
  }

  handleClose() {
    if (this.props.handleClose && !this.props.busy) this.props.handleClose();
  }

  handleConfirm() {
    if (this.validate() && this.props.handleConfirm)
      this.props.handleConfirm(this.state.value, this.state.initialValue);
  }

  validate() {
    let value = this.state.value || "";
    return /^[a-zA-Z0-9_-]+([/][a-zA-Z0-9_-]+)*$/.test(value) && value.length > 0;
  }

  handleChange = (e: any) => {
    this.setState({ value: e.target.value });
  };

  render() {
    let { busy, confirmLabel } = this.props;
    let valid = this.validate();

    return (
      <Dialog
        title={this.props.title}
        modal={true}
        open={true}
        onRequestClose={this.handleClose}
        actions={[
          <FlatButton disabled={busy} primary={true} label="Cancel" onClick={this.handleClose.bind(this)} />,
          <FlatButton
            disabled={busy || !valid}
            primary={true}
            label={confirmLabel}
            onClick={this.handleConfirm.bind(this)}
          />
        ]}
      >
        <TextField
          floatingLabelText="Item Name"
          value={this.state.value}
          disabled={busy}
          onChange={this.handleChange}
          floatingLabelFixed={true}
          underlineShow={true}
          fullWidth={true}
        />

        {this.state.valid ? undefined : <p>Allowed characters: alphanumeric, dash, underline and slash.</p>}

        {busy ? <Spinner /> : undefined}
      </Dialog>
    );
  }
}

type CollectionProps = {
  siteKey: string;
  workspaceKey: string;
  collectionKey: string;
};

type CollectionState = {
  selectedWorkspaceDetails: WorkspaceConfig | null;
  filter: string;
  items?: Array<{ key: string; label: string }>;
  filteredItems: Array<{ key: string; label: string }>;
  trunked: boolean;
  view?: { key?: string; item: any };
  modalBusy: boolean;
  dirs: Array<string>;
};

class CollectionListItems extends React.PureComponent<{
  filteredItems: Array<any>;
  onItemClick: (item: any) => void;
  onRenameItemClick: (item: any) => void;
  onDeleteItemClick: (item: any) => void;
}> {
  render() {
    let { filteredItems, onItemClick, onRenameItemClick, onDeleteItemClick } = this.props;
    return (
      <React.Fragment>
        {filteredItems.map((item, index) => {
          let iconButtonElement = (
            <IconButton touch={true}>
              <MoreVertIcon />
            </IconButton>
          );

          let rightIconMenu = (
            <IconMenu iconButtonElement={iconButtonElement}>
              <MenuItem onClick={() => onRenameItemClick(item)}>Rename</MenuItem>
              <MenuItem onClick={() => onDeleteItemClick(item)}>Delete</MenuItem>
            </IconMenu>
          );

          return (
            <Fragment key={item.key}>
              {index !== 0 ? <Divider /> : undefined}
              <ListItem
                primaryText={item.label || item.key}
                onClick={() => {
                  onItemClick(item);
                }}
                rightIconButton={rightIconMenu}
              />
            </Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

class Collection extends React.Component<CollectionProps, CollectionState> {
  filterDebounce = new Debounce(200);
  history: any;

  constructor(props: CollectionProps) {
    super(props);
    this.state = {
      selectedWorkspaceDetails: null,
      filter: "",
      filteredItems: [],
      trunked: false,
      modalBusy: false,
      dirs: []
    };
  }

  setCreateItemView() {
    this.setState({ view: { key: "createItem", item: null }, modalBusy: false });
  }

  setRenameItemView(item: any) {
    this.setState({ view: { key: "renameItem", item }, modalBusy: false });
  }

  setDeleteItemView(item: any) {
    this.setState({ view: { key: "deleteItem", item }, modalBusy: false });
  }

  setRootView() {
    this.setState({ view: undefined, modalBusy: false });
  }

  componentWillMount() {
    service.registerListener(this);
  }

  componentDidMount() {
    this.refreshItems();
  }

  refreshItems() {
    var stateUpdate: any = {};
    var { siteKey, workspaceKey, collectionKey } = this.props;
    if (siteKey && workspaceKey && collectionKey) {
      Promise.all([
        service.api.listCollectionItems(siteKey, workspaceKey, collectionKey).then(items => {
          stateUpdate.items = items;
          stateUpdate = { ...stateUpdate, ...this.resolveFilteredItems(items) };
        }),
        service.api.getWorkspaceDetails(siteKey, workspaceKey).then(workspaceDetails => {
          stateUpdate.selectedWorkspaceDetails = workspaceDetails;
        })
      ])
        .then(() => {
          this.setState(stateUpdate);
        })
        .catch(e => {});
    }
  }

  componentWillUnmount() {
    service.unregisterListener(this);
  }

  deleteCollectionItem() {
    let { siteKey, workspaceKey, collectionKey } = this.props;
    const view = this.state.view;
    if (view == null) return;
    service.api.deleteCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key).then(
      () => {
        let itemsCopy: Array<any> = (this.state.items || []).slice(0);
        let itemIndex = itemsCopy.findIndex(x => x.key === view.item.key);
        itemsCopy.splice(itemIndex, 1);
        this.setState({ items: itemsCopy, modalBusy: false, view: undefined, ...this.resolveFilteredItems(itemsCopy) });
      },
      () => {
        this.setState({ modalBusy: false, view: undefined });
      }
    );
  }

  renameCollectionItem(itemKey: string, itemOldKey: string) {
    let { siteKey, workspaceKey, collectionKey } = this.props;
    if (this.state.view == null) return;
    let view = this.state.view;
    service.api.renameCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey).then(
      result => {
        if (result.renamed) {
          let itemsCopy: Array<any> = (this.state.items || []).slice(0);
          let itemIndex = itemsCopy.findIndex(x => x.label === itemOldKey);
          itemsCopy[itemIndex] = result.item;
          this.setState({
            items: itemsCopy,
            modalBusy: false,
            view: undefined,
            ...this.resolveFilteredItems(itemsCopy)
          });
        } else {
          //TODO: warn someone!
          this.setState({ modalBusy: false, view: undefined });
        }
      },
      () => {
        //TODO: warn someone!
        this.setState({ modalBusy: false, view: undefined });
      }
    );
  }

  createCollectionItemKey(itemKey: string) {
    this.setState({ modalBusy: true });
    let { siteKey, workspaceKey, collectionKey } = this.props;
    service.api
      .createCollectionItemKey(siteKey, workspaceKey, collectionKey, itemKey)
      .then(
        ({ unavailableReason, key }) => {
          if (unavailableReason) {
            //TODO: display some warning
            this.setState({ modalBusy: false });
          } else {
            //refresh
            this.refreshItems();
          }
        },
        e => {
          this.setState({ modalBusy: false });
        }
      )
      .then(() => {
        this.setRootView();
      });
  }

  resolveFilteredItems = (items: Array<any>) => {
    let trunked = false;
    let dirs: { [key: string]: boolean } = { "": true };
    let filteredItems: Array<any> = (items || []).filter(item => {
      let parts = item.label.split("/");
      let c = "";
      for (let i = 0; i < parts.length - 1; i++) {
        c = c + parts[i] + "/";
        dirs[c] = true;
      }

      return item.key.startsWith(this.state.filter);
    });
    if (filteredItems.length > MAX_RECORDS) {
      filteredItems = filteredItems.slice(0, MAX_RECORDS);
      trunked = true;
    }
    let dirsArr: Array<string> = Object.keys(dirs);
    return { filteredItems, trunked, dirs: dirsArr };
  };

  handleFilterChange = (e: any, value: string) => {
    this.setState({ filter: value });
    this.filterDebounce.run(() => {
      this.setState(this.resolveFilteredItems(this.state.items || []));
    });
  };

  handleItemClick = (item: any) => {
    let { siteKey, workspaceKey, collectionKey } = this.props;
    let path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(
      workspaceKey
    )}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(item.key)}`;
    this.history.push(path);
  };

  handleDeleteItemClick = (item: any) => {
    this.setDeleteItemView(item);
  };

  handleRenameItemClick = (item: any) => {
    this.setRenameItemView(item);
  };

  handleDirClick = (e: any) => {
    this.setState({ filter: e.currentTarget.dataset.dir });
    this.filterDebounce.run(() => {
      this.setState(this.resolveFilteredItems(this.state.items || []));
    });
  };

  render() {
    let { siteKey, workspaceKey, collectionKey } = this.props;
    let { filteredItems, trunked } = this.state;
    let dialog: any = undefined;

    if (this.state.view) {
      let view = this.state.view;
      if (view.key === "createItem") {
        dialog = (
          <EditItemKeyDialog
            value=""
            title="New Item"
            busy={this.state.modalBusy}
            handleClose={this.setRootView.bind(this)}
            handleConfirm={this.createCollectionItemKey.bind(this)}
            confirmLabel="Create"
          />
        );
      } else if (view.key === "renameItem") {
        dialog = (
          <EditItemKeyDialog
            title="Rename Item"
            value={this.state.view.item.label}
            busy={this.state.modalBusy}
            handleClose={this.setRootView.bind(this)}
            handleConfirm={this.renameCollectionItem.bind(this)}
            confirmLabel="Rename"
          />
        );
      } else if (view.key === "deleteItem") {
        dialog = (
          <DeleteItemKeyDialog
            busy={this.state.modalBusy}
            handleClose={this.setRootView.bind(this)}
            handleConfirm={this.deleteCollectionItem.bind(this)}
            itemLabel={view.item.label}
          />
        );
      }
    }

    const selectedWorkspaceDetails = this.state.selectedWorkspaceDetails;
    if (selectedWorkspaceDetails == null) {
      return <Spinner />;
    }

    const collection = selectedWorkspaceDetails.collections.find(x => x.key == collectionKey);
    if (collection == null) return null;

    return (
      <Route
        render={({ history }) => {
          this.history = history;
          return (
            <div style={{ padding: "20px" }}>
              <Breadcumb items={[<BreadcumbItem label={collection.title} />]} />
              <br />
              <div>
                <RaisedButton
                  label="New Item"
                  onClick={
                    this.setCreateItemView.bind(
                      this
                    ) /* function(){ history.push('/collections/'+encodeURIComponent(collectionKey)+'/new') */
                  }
                />
                {/* <span> </span>
                    <RaisedButton label='New Section' onClick={ this.setCreateSectionView.bind(this) } /> */}
              </div>
              <br />
              <TextField
                floatingLabelText="Filter"
                onChange={this.handleFilterChange}
                fullWidth={true}
                value={this.state.filter}
                hintText="Item name"
              />
              <div style={{ display: "flex", flexWrap: "wrap", padding: "10px 0" }}>
                {this.state.dirs.map(dir => {
                  return (
                    <Chip key={dir} style={{ marginRight: "5px" }} onClick={this.handleDirClick} data-dir={dir}>
                      /{dir}
                    </Chip>
                  );
                })}
              </div>
              <Paper>
                <List>
                  <CollectionListItems
                    filteredItems={filteredItems}
                    onItemClick={this.handleItemClick}
                    onRenameItemClick={this.handleRenameItemClick}
                    onDeleteItemClick={this.handleDeleteItemClick}
                  />
                  {trunked ? (
                    <React.Fragment>
                      <Divider />
                      <ListItem
                        disabled
                        primaryText={`Max records limit reached (${MAX_RECORDS})`}
                        style={{ color: "rgba(0,0,0,.3)" }}
                      />
                    </React.Fragment>
                  ) : null}
                </List>
              </Paper>

              {dialog}
            </div>
          );
        }}
      />
    );
  }
}

export default Collection;
