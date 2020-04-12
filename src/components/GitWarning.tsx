import * as React from 'react';
import usePromise from 'react-promise';
import service from '../services/service';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { MuiTheme } from 'material-ui/styles';

interface Props {
  muiTheme?: MuiTheme;
}

const GitWarning = React.memo((props: Props) => {
    const gitExists = usePromise(service.api.gitExists);
    if (gitExists.loading) return (null);
    if (gitExists.error) return (<div style={{color: props.muiTheme?.textField.errorColor}}>Could not check if git is available. {gitExists.error}</div>);
    if (!gitExists.value) return (<div style={{color: props.muiTheme?.textField.errorColor}}>Looks like the command <strong>git</strong> is not available in your computer. Please, <a href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git">install git</a>.</div>);
    return (null);
});

export default muiThemeable()<typeof GitWarning, Props>(GitWarning);