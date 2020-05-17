import service from "./services/service";
import AnalyticsLight from "./utils/analytics-light";

interface EnvironmentInfo {
  machineId: string;
  version: string;
  platform: string;
}

class AnalyticsFacade {
  private _analytics: AnalyticsLight;
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
      this._clientId = localStorage.getItem("clientID") || undefined;
      this._analytics.set("uid", this._environmentInfo.machineId);
      return this._environmentInfo;
    }
  }

  constructor() {
    this._analytics = new AnalyticsLight("UA-115442088-3");
  }

  async pageView(path: string): Promise<any> {
    const env = await this._getEnviromentInfo();
    try {
      const result = await this._analytics.pageview("electron.hokus.com", path, undefined, this._clientId);
      //ugly
      this._clientId = this._clientId || result.clientID;
      if (this._clientId != null) {
        localStorage.setItem("clientID", this._clientId);
      }

    } catch (e) {}
  }
}

const analytics = new AnalyticsFacade();
export default analytics;
