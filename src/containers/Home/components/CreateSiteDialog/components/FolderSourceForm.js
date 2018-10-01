//@flow
import * as React from 'react';
import { RaisedButton, TextField } from 'material-ui';
import FolderPicker from './../../../../../components/FolderPicker';

type FolderSourceFormModel = {
    folderPath: string,
    theme: string
}

type FolderSourceFormProps = {
    onFormChange: (model: FolderSourceFormModel, valid: bool)=>void,
    model: FolderSourceFormModel
}

type FolderSourceFormState = {
    
}

export default class FolderSourceForm extends React.Component<FolderSourceFormProps,FolderSourceFormState>{
    
    validateModel(model: FolderSourceFormModel){
        let isValid = true;
        if(model.folderPath==null||model.folderPath.trim().length===0){
            isValid = false;
        }
        return isValid;
    }

    updateModel(modelUpdate: {}){
        let data = Object.assign({}, this.props.model, modelUpdate);
        let valid = this.validateModel(data);
        this.props.onFormChange(data, valid);
    }

    handleFolderSelected = (folderPath: ?string) => {
        this.updateModel({folderPath})
    }

    handleRepoURLChange = (e:any, theme: string) => {
        this.updateModel({theme})
    }

    render(){

        let { model={} } = this.props;

        return (<React.Fragment>
            <div>
                <FolderPicker
                    label={"Site Folder *"}
                    selectedFolder={model.folderPath}
                    onFolderSelected={this.handleFolderSelected} />
            </div>
            <div>
                <TextField
                    floatingLabelFixed={true}
                    value={model.theme||''}
                    onChange ={this.handleRepoURLChange}
                    fullWidth={true}
                    placeholder='Only for empty site folders'
                    floatingLabelText={'Theme Repository URL'}
                />
            </div>
        </React.Fragment>)
    }

}