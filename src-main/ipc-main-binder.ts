import { ipcMain } from "electron";
import api from "./api";

let enableLogging = process.env.ENV === "DEVELOPMENT";

class IpcMainBinder {
  handlers: any = {};
  binded: boolean = false;

  bind() {
    if(this.binded) return;
    for (var key in api) {
      if (!key.startsWith("_")) this.addListener(key);
    }

    ipcMain.on("message", (event: any, args: any) => {
      if (args.handler === undefined) throw "Could not find handler key in message.";

      let handler = this.handlers[args.handler];

      if (handler === undefined) throw `Could not find handler for key '${args.handler}'.`;

      handler(event, args);
    });
    this.binded = true;
  }

  addListener(key: string) {
    if (api.hasOwnProperty(key)) {
      if (enableLogging) console.log("IPC_MAIN_BIND_LISTENER: " + key);

      this.handlers[key] = function(event: any, args: any) {
        let context: any = {};

        context.reject = function(error: any) {
          let pack = {
            key: key + "Response",
            token: args.token,
            response: { error: error ? error.stack : "Something went wrong." }
          };
          event.sender.send("messageAsyncResponse", pack);
          console.log("IPC_MAIN_FAIL: " + key, pack);
        };

        context.resolve = function(response: any) {
          let pack = {
            key: key + "Response",
            token: args.token,
            response
          };
          event.sender.send("messageAsyncResponse", pack);
          console.log("IPC_MAIN_RESPONDED: " + key, pack);
        };

        if (enableLogging) console.log("IPC_MAIN_REQUESTED: " + key, args);

        api[key](args.data, context);
      };
    } else {
      throw `Could not find API method for key '${key}'.`;
    }
  }
}

export default new IpcMainBinder();
