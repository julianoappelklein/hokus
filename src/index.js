import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import bridge from './utils/main-process-bridge';

//STYLE STUFF
import './css/index.css';
import './css/bootstrap-grid.css';

const isDev = window.require('electron-is-dev');
if(isDev){
    console.log('Running in development');
}
else{
    console.log('Running in production');
}


ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);