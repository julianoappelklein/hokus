//@flow

import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import IconMore from 'material-ui/svg-icons/navigation/more-vert';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const Fragment = React.Fragment;
const translucentColor = 'RGBA(255,255,255,.2)';
const translucentColorSubtle = 'RGBA(255,255,255,.05)';

type ExtraOptionsProps = {
  items: Array<React.Element<typeof MenuItem>>
}

type ExtraOptionsState = {
  buttonVisible: bool,
  menuOpen: bool,
  anchorEl: ?any
}
class ExtraOptions extends React.Component<ExtraOptionsProps,ExtraOptionsState>{
  
    closeTimeout : any;
  
    constructor(props: any){
      super(props);
      this.state = {
        buttonVisible:false,
        menuOpen: false,
        anchorEl: null
      };
    }
  
    handleRequestClose(){
      this.setState({menuOpen: false});    
    }
  
    handleMouseEnter(e: Event){
      this.setState({buttonVisible:true });
    }
  
    handleMouseLeave(e: Event){
      this.setState({buttonVisible:false });
    }
  
    handleClick(e: Event){
      e.preventDefault();
      this.setState({menuOpen:true, anchorEl: e.currentTarget });
    }
  
    requestClose(){
      if(this.closeTimeout)
      clearTimeout(this.closeTimeout);
      this.closeTimeout = setTimeout(function(){
        this.setState({menuOpen:false});
      }.bind(this), 300);
    }
  
    render(){
      return <Fragment><RaisedButton
        style={{
          minWidth: 45,
          position: 'fixed',
          zIndex: 3,
          bottom: 40,
          left: 0,
          transform: (this.state.buttonVisible||this.state.menuOpen ? undefined : 'translateX(-30px)')
        }}
        icon={<IconMore />}
        onClick={ this.handleClick.bind(this) }
        onMouseEnter={ this.handleMouseEnter.bind(this) }
        onMouseLeave={ this.handleMouseLeave.bind(this) }
       />
       <Popover
          open={this.state.menuOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
          onRequestClose={this.handleRequestClose.bind(this)}
        >
          <Menu onClick={()=> this.requestClose() }>
            { this.props.items.map((item, key)=>{
              return React.cloneElement(item, {key});
            }) }
          </Menu>
        </Popover>
      </Fragment>
    }
  }

  export default ExtraOptions;