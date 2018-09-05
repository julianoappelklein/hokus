//@flow

import React from 'react';
import { Breadcumb, BreadcumbItem } from './../components/Breadcumb';
import { Route } from 'react-router-dom';
import service from './../services/service'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List'
import Spinner from './../components/Spinner'
import Dialog from 'material-ui/Dialog'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

const Fragment = React.Fragment;

type DeleteItemKeyDialogProps = {
    busy: bool,
    itemLabel: string,
    handleClose: ()=> void,
    handleConfirm: (string)=> void
}

type DeleteItemKeyDialogState = {
    value:string,
    valid: ?bool
}

class DeleteItemKeyDialog extends React.Component<DeleteItemKeyDialogProps,DeleteItemKeyDialogState>{
    constructor(props : DeleteItemKeyDialogProps){
        super(props);
        this.state = {
            value:'',
            valid: null
        }
    }
    
    handleClose(){
        if(this.props.handleClose && !this.props.busy)
            this.props.handleClose();
    }

    handleConfirm(){
        if(this.props.handleConfirm)
            this.props.handleConfirm(this.state.value);
    }

    render(){
        let { busy, itemLabel } = this.props;

        return (
            <Dialog
                title={"Delete Item"}
                modal={true}
                open={true}
                onRequestClose={this.handleClose}
                actions={[
                  <FlatButton disabled={busy} primary={true} label="Cancel" onClick={this.handleClose.bind(this)} />,
                  <FlatButton disabled={busy} primary={true} label="Delete" onClick={this.handleConfirm.bind(this)}  />
                ]}
            >
                {this.state.valid? undefined : <p>Do you really want to delete the item <b>"{itemLabel}"</b>?</p>}

                { busy? <Spinner style={{margin:'0 auto'}} /> : undefined }
                
            </Dialog>
        );
    }
}

type EditItemKeyDialogProps = {
    busy: bool,
    value:?string,
    title:string,
    confirmLabel: string,
    handleClose: ()=> void,
    handleConfirm: (value:string, initialValue:string)=> void
}

type EditItemKeyDialogState = {
    value:string,
    initialValue: string,
    valid: ?bool
}

class EditItemKeyDialog extends React.Component<EditItemKeyDialogProps,EditItemKeyDialogState>{

    constructor(props : EditItemKeyDialogProps){
        super(props);
        this.state = {
            value:props.value||'',
            initialValue:props.value||'',
            valid: null
        };
    }

    handleClose(){
        if(this.props.handleClose && !this.props.busy)
            this.props.handleClose();
    }

    handleConfirm(){
        if(this.state.valid && this.props.handleConfirm)
            this.props.handleConfirm(this.state.value, this.state.initialValue);
    }

    validateValue(value){
        value = value||'';
        return /^[a-zA-Z0-9_-]+$/.test(value) && value.length>0;
    }

    handleChange(e){
        let value = e.target.value;
        let valid = this.validateValue(value);
        this.setState({value, valid});
    }

    render(){
        let { busy, confirmLabel } = this.props;

        return (
            <Dialog
                title={this.props.title}
                modal={true}
                open={true}
                onRequestClose={this.handleClose}
                actions={[
                  <FlatButton disabled={busy} primary={true} label="Cancel" onClick={this.handleClose.bind(this)} />,
                  <FlatButton disabled={busy} primary={true} label={confirmLabel} onClick={this.handleConfirm.bind(this)}  />
                ]}
            >
                <TextField
                    floatingLabelText="Item Name"
                    value={this.state.value}
                    disabled={busy}
                    onChange={this.handleChange.bind(this)}
                    floatingLabelFixed={true}
                    underlineShow={true}
                    fullWidth={true}
                />

                {this.state.valid? undefined : <p>Please, use alphanumeric values, '_' and '-'.</p>}

                { busy? <Spinner style={{margin:'0 auto'}} /> : undefined }
                
            </Dialog>
        );
    }
}

type CollectionProps = {
    siteKey : string,
    workspaceKey : string,
    collectionKey : string
}

type CollectionState = {
    selectedWorkspaceDetails: null,
    filter: string,
    items: ?Array<{key:string, label:string}>,
    view: ?{ key: ?string, item: any },
    modalBusy: bool
}

class Collection extends React.Component<CollectionProps,CollectionState>{
    constructor(props : CollectionProps){
        super(props);
        this.state = {
            selectedWorkspaceDetails: null,
            items:null,
            filter: '',
            view: null,
            modalBusy: false
        };
    }

    setStateWithLog(data : any){
        console.log(JSON.stringify(data))
        this.setState(data);
    }

    setCreateItemView(){
        this.setStateWithLog({view:{key:'createItem'}, modalBusy:false});
    }

    setRenameItemView(item: any){
        this.setStateWithLog({view:{key:'renameItem', item}, modalBusy:false});
    }

    setDeleteItemView(item: any){
        this.setStateWithLog({view:{key:'deleteItem', item }, modalBusy:false});
    }

    setRootView(){
        this.setStateWithLog({view:undefined, modalBusy:false});
    }

    componentWillMount(){
        service.registerListener(this);
    }

    componentDidMount(){
        var stateUpdate  = {};
        var { siteKey, workspaceKey, collectionKey } = this.props;
        if(siteKey && workspaceKey && collectionKey){
            Promise.all([
                service.api.listCollectionItems(siteKey, workspaceKey, collectionKey).then((items)=>{
                    stateUpdate.items = items;
                }),
                service.api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails)=>{
                    stateUpdate.selectedWorkspaceDetails = workspaceDetails;
                })
            ]).then(()=>{
                this.setState(stateUpdate);
            });
        }
    }

    refreshItems(){
        var { siteKey, workspaceKey, collectionKey } = this.props;
        service.api.listCollectionItems(siteKey, workspaceKey, collectionKey).then((items)=>{
            this.setState({items});
        })
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }

    deleteCollectionItem(){
        let { siteKey, workspaceKey, collectionKey } = this.props;
        let view = this.state.view;
        if(view==null) return;
        service.api.deleteCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key)
            .then(()=>{
                let itemsCopy : Array<any> = (this.state.items||[]).slice(0);
                let itemIndex = itemsCopy.findIndex(x=>x.key === view.item.key);
                itemsCopy.splice(itemIndex,1);
                this.setStateWithLog({items:itemsCopy, modalBusy:false, view: undefined});
            },()=>{
                this.setState({modalBusy:false, view: undefined});
            });
    }

    renameCollectionItem(itemKey : string, itemOldKey: string){
        let { siteKey, workspaceKey, collectionKey } = this.props;
        if(this.state.view==null)return;
        let view = this.state.view;
        service.api.renameCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
            .then((result)=>{
                if(result.renamed){
                    let itemsCopy : Array<any> = (this.state.items||[]).slice(0);
                    let itemIndex = itemsCopy.findIndex(x=>x.label === itemOldKey);
                    itemsCopy[itemIndex] = result.item;
                    this.setStateWithLog({items:itemsCopy, modalBusy:false, view: undefined});
                }
                else{
                    //TODO: warn someone!
                    this.setStateWithLog({modalBusy:false, view: undefined});
                }
            },()=>{
                //TODO: warn someone!
                this.setStateWithLog({modalBusy:false, view: undefined});
            });
    }

    createCollectionItemKey(itemKey : string){
        this.setStateWithLog({modalBusy:true});
        let { siteKey, workspaceKey, collectionKey } = this.props;
        service.api.createCollectionItemKey(siteKey, workspaceKey, collectionKey, itemKey)
            .then(({unavailableReason, key})=>{
                if(unavailableReason){
                    //TODO: display some warning
                    this.setStateWithLog({modalBusy:false});
                }
                else{
                    //refresh
                    this.refreshItems();
                }
            }, (e)=>{
                this.setStateWithLog({modalBusy:false});
            }).then(()=>{
                this.setRootView();
            });
    }

    render(){
        
        let { siteKey, workspaceKey, collectionKey } = this.props;
        let dialog = undefined;

        if(this.state.view){
            let view = this.state.view;
            if(view.key==='createItem'){
                dialog = (<EditItemKeyDialog
                    value=""
                    title="New Item"
                    busy={this.state.modalBusy}
                    handleClose={this.setRootView.bind(this)}
                    handleConfirm={this.createCollectionItemKey.bind(this)}
                    confirmLabel="Create"
                />);
            }
            else if(view.key==='renameItem'){
                dialog = (<EditItemKeyDialog
                    title="Rename Item"
                    value={this.state.view.item.label}
                    busy={this.state.modalBusy}
                    handleClose={this.setRootView.bind(this)}
                    handleConfirm={this.renameCollectionItem.bind(this)}
                    confirmLabel="Rename"
                />);
            }
            else if(view.key==="deleteItem"){
                dialog = <DeleteItemKeyDialog
                    busy={this.state.modalBusy}
                    handleClose={this.setRootView.bind(this)}
                    handleConfirm={this.deleteCollectionItem.bind(this)}
                    itemLabel={view.item.label}
                />
            }
        }

        if(this.state.selectedWorkspaceDetails==null){
            return (<div style={{padding:'20px'}}><Spinner /></div>);
        }

        let collection = this.state.selectedWorkspaceDetails.collections.find(x => x.key == collectionKey);
        if(collection==null)
            return null;

        return(<Route render={ ({history}) => (
            <div style={{padding:'20px'}}>
                <Breadcumb items={[<BreadcumbItem label={collection.title} />]} />
                <br />
                <div>
                    <RaisedButton label='New Item' onClick={ this.setCreateItemView.bind(this) /* function(){ history.push('/collections/'+encodeURIComponent(collectionKey)+'/new') */ } />
                    {/* <span> </span>
                    <RaisedButton label='New Section' onClick={ this.setCreateSectionView.bind(this) } /> */}
                </div>
                <br />
                

                    <Fragment>
                        <TextField
                            floatingLabelText="Filter"
                            onChange={(e,value)=>{ this.setState({filter:value}) }}
                            fullWidth={true}
                            value={this.state.filter}
                            hintText="Item name" />
                        <Paper>
                            <List>
                                { (this.state.items||[]).filter((item)=> { return item.key.startsWith(this.state.filter) }).map((item, index) => {  

                                    let iconButtonElement = (
                                        <IconButton touch={true}>
                                            <MoreVertIcon/>
                                        </IconButton>
                                    );
                                    
                                    let rightIconMenu = (
                                        <IconMenu iconButtonElement={iconButtonElement}>
                                            <MenuItem onClick={()=> this.setRenameItemView(item) }>Rename</MenuItem>
                                            <MenuItem onClick={()=> this.setDeleteItemView(item) }>Delete</MenuItem>
                                        </IconMenu>
                                    );

                                    return (<Fragment key={item.key}>
                                        {index!==0?<Divider />:undefined}
                                        <ListItem
                                            primaryText={item.label||item.key}
                                            onClick={ ()=>{
                                                let path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(item.key)}`
                                                history.push(path);
                                            }}
                                            rightIconButton={rightIconMenu}
                                        />
                                    </Fragment>)
                                }) }
                            </List>
                        </Paper>
                    </Fragment>
                { dialog }
            </div>)
        } />);        
    }
}

export default Collection;