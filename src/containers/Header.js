import React from 'react';
import {Route} from 'react-router-dom';
import logo from './../img/logo.svg';
import IconButton from 'material-ui/IconButton';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconFullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import IconFullscreenExit from 'material-ui/svg-icons/navigation/fullscreen-exit';
import IconMinimize from 'material-ui/svg-icons/content/remove';

const Header = ({minimizeHandler, toggleMaximizeHandler, closeHandler, isMaximized})=>{
    return <header style={{ WebkitAppRegion: 'drag'}} className='App-header'>
        <Route render={({history})=>
            <img
                style={{ WebkitAppRegion: 'no-drag', cursor:'pointer'}}
                src={logo}
                onClick={function(){ history.push('/') }}
                className="App-logo"
                alt="logo" />
        }></Route>
        <h1 className="App-title">Hokus - a CMS for Hugo</h1>
        <div style={{position:'absolute', right:'10px', top:'-3px', WebkitAppRegion: 'no-drag'}}>
        <IconButton onClick={ minimizeHandler }>
            <IconMinimize color={'#ffffff'} />
        </IconButton>
        <IconButton onClick={ toggleMaximizeHandler }>
            { isMaximized?<IconFullscreenExit color={'#ffffff'} />:<IconFullscreen color={'#ffffff'} /> }
        </IconButton>
        <IconButton onClick={ closeHandler }>
            <IconClose color={'#ffffff'} />
        </IconButton>
        </div>
    </header>

}

export default Header;