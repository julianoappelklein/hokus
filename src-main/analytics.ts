const Analytics = require("electron-google-analytics");
import {machineId, machineIdSync} from 'node-machine-id';
import { app } from 'electron';

class AnalyticsFacade{
    
    private _analytics: any;
    private _setsDone: boolean = false;
    private _version: string = "";
    private _clientId: string = "";
    private _platform: string = "";

    constructor(){
        this._analytics = new Analytics.default('UA-23159736-5');
    }

    async screen(screenName: string): Promise<any>{
        await this._ensureInit();
        return this._analytics.screen('Hokus Electron', `${this._version}-${this._platform}`, 'hokus-electron', screenName, this._clientId);
    }

    private async _ensureInit(): Promise<void>{
        if(this._setsDone===false){
            this._clientId = await machineId(false);
            this._version = app.getVersion();            
            this._platform = process.platform;
            this._setsDone = true;
        }
    }
}

const analytics = new AnalyticsFacade();
export default analytics;