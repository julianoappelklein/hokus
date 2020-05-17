import { v4 as uuidv4 } from "uuid";

class AnalyticsLight {
  private globalDebug: boolean;
  private globalUserAgent: string;
  private globalBaseURL: string;
  private globalDebugURL: string;
  private globalCollectURL: string;
  // private globalBatchURL: string;
  private globalTrackingID: string;
  private globalVersion: number;
  private customParams: { [key: string]: string };

  constructor(trackingID: string, { userAgent = "", debug = false, version = 1 } = {}) {
    // Debug
    this.globalDebug = debug;
    // User-agent
    this.globalUserAgent = userAgent;
    // Links
    this.globalBaseURL = "https://www.google-analytics.com";
    this.globalDebugURL = "/debug";
    this.globalCollectURL = "/collect";
    // this.globalBatchURL = "/batch";
    // Google generated ID
    this.globalTrackingID = trackingID;
    // Google API version
    this.globalVersion = version;
    // Custom parameters
    this.customParams = {};
  }

  public set(key: string, value: string) {
    if (value !== null) {
      this.customParams[key] = value;
    } else {
      delete this.customParams[key];
    }
  }

  public pageview(
    hostname: string,
    url: string,
    title?: string,
    clientID?: string,
    sessDuration?: string
  ): Promise<any> {
    const params: { dh: string; dp: string; dt?: string; sc?: string } = {
      dh: hostname,
      dp: url,
      dt: title
    };

    if (typeof sessDuration !== "undefined") {
      params.sc = sessDuration;
    }

    return this.send("pageview", params, clientID);
  }

  event(
    evCategory: string,
    evAction: string,
    { evLabel, evValue, clientID }: { evLabel?: string; evValue?: string; clientID?: string } = {}
  ) {
    const params: { ec: string; ea: string; el?: string; ev?: string } = { ec: evCategory, ea: evAction };

    if (evLabel) params.el = evLabel;
    if (evValue) params.ev = evValue;

    return this.send("event", params, clientID);
  }

  private async send(hitType: string, params: { [key: string]: string | undefined }, clientID?: string): Promise<any> {
    const cid = clientID || uuidv4();
    const formObj = {
      v: this.globalVersion,
      tid: this.globalTrackingID,
      cid: cid,
      t: hitType
    };
    if (params) Object.assign(formObj, params);

    if (Object.keys(this.customParams).length > 0) {
      Object.assign(formObj, this.customParams);
    }

    let url = `${this.globalBaseURL}${this.globalCollectURL}`;
    if (this.globalDebug) {
      url = `${this.globalBaseURL}${this.globalDebugURL}${this.globalCollectURL}`;
    }
    const body = Object.keys(formObj)
      .map(key => `${encodeURI(key)}=${encodeURI((formObj as any)[key])}`)
      .join("&");
    const reqObj: { method: string; body: string; headers?: { [key: string]: string } } = {
      method: "post",
      body: body
    };

    if (this.globalUserAgent !== "") {
      reqObj.headers = { "User-Agent": this.globalUserAgent };
    }

    try {
      await fetch(url, reqObj);
      return { clientID: cid };
    } catch (err) {
      return new Error(err);
    }
  }
}

export default AnalyticsLight;
