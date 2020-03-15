import * as React from 'react';
import { Dialog, FlatButton, MenuItem, SelectField, TextField } from 'material-ui';
import FolderSourceForm from './components/FolderSourceForm';

type CreateSiteDialogProps = {
    open: boolean,
    onCancelClick: ()=>void,
    onSubmitClick: (model: any)=>void
}

type CreateSiteDialogState = {
    formIsValid: boolean,
    model: any,
    sourceIndex: number,
    key: string
}

function NotImplementedSourceForm(){
    return <p>This feature is not implemented yet.</p>;
}

const SITE_SOURCES = [
    { key:'folder', title:'Folder', enabled: true, form: FolderSourceForm, description:'' },
    { key:'git', title:'Git', enabled: false, form: NotImplementedSourceForm, description:'' },
    { key:'ftp', title:'FTP', enabled: false, form: NotImplementedSourceForm, description:'' },
    { key:'aws-s3', title:'AWS S3', enabled: false, form: NotImplementedSourceForm, description:'' }
];

const INITIAL_STATE = {
    formIsValid: false,
    model: {},
    sourceIndex: -1,
    key:''
};

export default class CreateSiteDialog extends React.Component<CreateSiteDialogProps,CreateSiteDialogState>{
    
    constructor(props: CreateSiteDialogProps){
        super(props);

        this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    }

    handleFormChange = (model: any, valid: boolean) => {
        this.setState({ model, formIsValid: valid });
    }

    handleCancelClick = () => {
        this.setState({
            formIsValid: false,
            model: {},
            sourceIndex: -1
        });
        this.props.onCancelClick();
    }

    handleSubmitClick = () => {
        let data = Object.assign({},
            JSON.parse(JSON.stringify(this.state.model)),
            {
                sourceType: SITE_SOURCES[this.state.sourceIndex].key,
                key: this.state.key
            }
        );
        this.props.onSubmitClick(data);
        this.setState(JSON.parse(JSON.stringify(INITIAL_STATE)));
    }

    handleSourceChange = (e: any, index: number) => {
        this.setState({sourceIndex: index, formIsValid: false});
    }

    handleKeyChange = (e: any, value: string) => {
        this.setState({key: value});
    }

    validate(){
        let { formIsValid, sourceIndex, key } = this.state;
        let source = SITE_SOURCES[sourceIndex];
    
        if(source==null || !source.enabled)
            return false;
        if(!formIsValid)
            return false;
        if(key.length===0 || /[^a-z0-9_-]/.test(key)){
            return false;
        }
        return true;
        
    }

    render(){

        let { open } = this.props;
        let { model, sourceIndex, key } = this.state;
        let source = SITE_SOURCES[sourceIndex];
        let SourceForm = source ? source.form : null;
        
        let valid = this.validate();

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleCancelClick}
            />,
            <FlatButton
                disabled={!valid}
                label="Submit"
                primary={true}
                onClick={this.handleSubmitClick}
            />,
        ];

        return (
            <Dialog
                title="New Site"
                open={open}
                actions={actions}
            >
                <TextField
                    floatingLabelText="Key *"
                    floatingLabelFixed={true}
                    fullWidth={true}
                    placeholder='Only lowercase letters, numbers, "-" and "_".'
                    value={key}
                    onChange={this.handleKeyChange}
                />
                <SelectField
                    onChange={this.handleSourceChange}
                    fullWidth
                    value={sourceIndex}
                    floatingLabelText="Source Type *">
                    {SITE_SOURCES.map((s, i)=>(
                        <MenuItem
                            key={s.key} value={i}
                            primaryText={`${s.title}${s.enabled?'':' - Not Implemented'}`}
                        />
                    ))}
                </SelectField>
                { SourceForm ? (
                    <SourceForm
                        model={model}
                        onFormChange={this.handleFormChange} />
                ) : ( null ) }
            </Dialog>
        );
    }

}