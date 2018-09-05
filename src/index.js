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

    document.bridge = bridge;

    (function addRightClickInspect(){
        if(window.require){
            const {remote} = window.require('electron')
            const {Menu, MenuItem} = remote
            
            const menu = new Menu()

            let rightClickPosition = null
            
            menu.append(new MenuItem({ label: 'Inspect Element', click: () => {
                remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
            }}))

            window.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                rightClickPosition = {x: e.x, y: e.y}
                menu.popup(remote.getCurrentWindow())
            }, false);
        }
    })();
}


ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);