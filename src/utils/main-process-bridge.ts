type MessageHandler = (eventData: any, arg?: any) => void;

export type AbortablePromise<T> = Promise<T> & { forceAbort: () => void };

class MainProcessBridge {
  ipcRenderer: {
    send: (str: string, data: any) => void;
    on: (event: string, messageHandler: MessageHandler) => void;
  };

  _messageHandlers: { [key: string]: Array<MessageHandler> };

  pendingCallbacks: Array<{ token: string; handler: MessageHandler }>;

  constructor() {
    this._messageHandlers = {};
    this.ipcRenderer = window.require("electron").ipcRenderer;
    this.pendingCallbacks = [];

    this.ipcRenderer.on("messageAsyncResponse", (event, arg) => {
      const { token, response, key } = arg;
      let callback = this._getCallback(token);
      if (callback) {
        callback(response);
        //console.log('Returned response:', JSON.stringify(response), key);
      } else {
        //console.log('Response without callback.', key);
      }
    });

    this.ipcRenderer.on("message", (sender, message) => {
      if (message.type) {
        let handlers = this._messageHandlers[message.type];
        if (handlers) {
          for (let i = 0; i < handlers.length; i++) {
            handlers[i](message.data);
          }
        }
      } else {
        console.log("Received message without a type.");
      }
    });
  }

  addMessageHandler(type: string, handler: MessageHandler) {
    let handlers = this._messageHandlers[type];
    if (handlers === undefined) {
      handlers = [];
      this._messageHandlers[type] = handlers;
    }
    handlers.push(handler);
  }

  removeMessageHandler(type: string, handler: MessageHandler) {
    let handlers = this._messageHandlers[type];
    if (handlers === undefined) {
      return;
    }
    handlers.splice(handlers.indexOf(handler), 1);
  }

  _createToken(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
  }

  _getCallback(token: string): MessageHandler | undefined {
    for (let i = 0; i < this.pendingCallbacks.length; i++) {
      let callback = this.pendingCallbacks[i];
      if (callback.token === token) return callback.handler;
    }
    return undefined;
  }

  _eraseCallback(token: string) {
    for (let i = 0; i < this.pendingCallbacks.length; i++) {
      let callback = this.pendingCallbacks[i];
      if (callback.token === token) {
        this.pendingCallbacks.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  _emptyFunction() {}

  request(method: string, data: any, opts: { timeout: number } = { timeout: 10000 }): AbortablePromise<any> {
    let _reject: any;
    let token = this._createToken();
    let promise: any = new Promise(
      (resolve: (value?: unknown) =>void, reject: (reasone?: any)=>void) => {
        _reject = reject;
        this.ipcRenderer.send("message", { data, token, handler: method });
        let timeoutId = setTimeout(
          () => {
            if (this._eraseCallback(token)) {
              reject("timeout");
              promise.forceAbort = function() {};
            }
          },
          opts.timeout
        );
        this.pendingCallbacks.push({
          token,
          handler: function(response) {
            clearTimeout(timeoutId);
            if (response && response.error) {
              reject(response.error);
            }
            resolve(response);
            promise.forceAbort = function() {};
          }
        });
      }
    );

    promise.forceAbort = () => {
      console.log("Promise aborted.");
      _reject("Cancelled");
      this._eraseCallback(token);
    };

    return promise;
  }

  requestVoid(method: string, data: any) {
    this.ipcRenderer.send("message", { data, handler: method });
  }
}

export default new MainProcessBridge();
