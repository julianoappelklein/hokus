//@flow
import * as React from 'react';
import { RaisedButton, TextField } from 'material-ui';
import FolderPicker from './../../../../../components/FolderPicker';

type FolderSourceFormModel = {
    folderPath: string
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

    handleFolderSelected(folderPath: ?string){
        this.updateModel({folderPath})
    }

    render(){

        let { model={} } = this.props;

        return (
            <div>
                <FolderPicker
                    selectedFolder={model.folderPath}
                    onFolderSelected={this.handleFolderSelected.bind(this)} />
            </div>
        )
    }

}