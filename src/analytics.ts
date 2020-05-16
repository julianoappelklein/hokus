const Analytics = require("electron-google-analytics");
import service from "./services/service";

interface EnvironmentInfo {
  machineId: string;
  version: string;
  platform: string;
}

class AnalyticsFacade {
  private _analytics: any;
  private _environmentInfo?: EnvironmentInfo;
  private _environmentInfoPromise?: Promise<EnvironmentInfo>;
  private _clientId?: string;

  private async _getEnviromentInfo() {
    if (this._environmentInfo != null) return this._environmentInfo;
    if (this._environmentInfoPromise != null) {
      return await this._environmentInfoPromise;
    } else {
      this._environmentInfoPromise = service.api.getEnviromentInfo();
      this._environmentInfo = await this._environmentInfoPromise;
      this._analytics.set("uid", this._environmentInfo.machineId);
      return this._environmentInfo;
    }
  }

  constructor() {
    this._analytics = new Analytics.default("UA-115442088-3");
  }

  async screen(screenName: string): Promise<any> {
    const env = await this._getEnviromentInfo();
    try {
      // const result = await this._analytics.screen("Hokus Electron", `${env.version}-${env.platform}`, "hokus-electron", screenName, this._clientId);
      //const result = await this._analytics.screen("test", "1.0.0", "com.app.test", "com.app.installer", "Test");
      //console.log(result);
    } catch (e) {}
  }
}

const analytics = new AnalyticsFacade();
export default analytics;
