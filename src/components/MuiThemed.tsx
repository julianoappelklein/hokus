import * as React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { MuiTheme } from 'material-ui/styles';

class _MuiThemed extends React.Component<{muiTheme?: MuiTheme, render: (theme: MuiTheme)=>React.ReactNode}>{
    render(){
        return this.props.render(this.props.muiTheme as any);
    }
    
}
const MuiThemed = muiThemeable()(_MuiThemed as any);
export default MuiThemed;