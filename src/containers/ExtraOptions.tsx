import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import IconMore from 'material-ui/svg-icons/navigation/more-vert';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
const Fragment = React.Fragment;


type ExtraOptionsProps = {
  items: Array<any>
}

type ExtraOptionsState = {
  buttonVisible: boolean,
  menuOpen: boolean,
  anchorEl?: any
}
class ExtraOptions extends React.Component<ExtraOptionsProps, ExtraOptionsState>{

  closeTimeout: any;

  constructor(props: any) {
    super(props);
    this.state = {
      buttonVisible: false,
      menuOpen: false,
      anchorEl: null
    };
  }

  handleRequestClose = () => {
    this.setState({ menuOpen: false });
  }

  handleMouseEnter = (e: any) => {
    this.setState({ buttonVisible: true });
  }

  handleMouseLeave = (e: any) => {
    this.setState({ buttonVisible: false });
  }

  handleClick = (e: any) => {
    e.preventDefault();
    this.setState({ menuOpen: true, anchorEl: e.currentTarget });
  }

  handleMenuClick = (e: any) => {
    if (this.closeTimeout)
      clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      this.setState({ menuOpen: false });
    }, 300);
  }

  render() {
    return (<React.Fragment>
      <RaisedButton
        style={{
          minWidth: 45,
          position: 'fixed',
          zIndex: 3,
          bottom: 40,
          left: 0,
          transform: (this.state.buttonVisible || this.state.menuOpen ? undefined : 'translateX(-30px)')
        } as any}
        icon={<IconMore />}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      />
      <Popover
        open={this.state.menuOpen}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onRequestClose={this.handleRequestClose}
      >
        <Menu onItemClick={this.handleMenuClick}>
          {this.props.items.map((item, key) => {
            return React.cloneElement(item, { key });
          })}
        </Menu>
      </Popover>
    </React.Fragment>);
  }
}

export default ExtraOptions;