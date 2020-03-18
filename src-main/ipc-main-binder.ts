import { ipcMain } from "electron";
import api from "./api";

let enableLogging = process.env.ENV === "DEVELOPMENT";

class IpcMainBinder {
  handlers: any = {};
  binded: boolean = false;

  bind() {
    if (this.binded) return;
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

      this.handlers[key] = async (event: any, args: any) => {
        if (enableLogging) console.log("IPC_MAIN_REQUESTED: " + key, args);

        try {
          const response = await api[key](args.data);
          let pack = {
            key: key + "Response",
            token: args.token,
            response
          };
          event.sender.send("messageAsyncResponse", pack);
        } catch (error) {
          let pack = {
            key: key + "Response",
            token: args.token,
            response: { error: error ? error.stack : "Something went wrong." }
          };
          event.sender.send("messageAsyncResponse", pack);
          console.log("IPC_MAIN_FAIL: " + key, pack);
        }
      };
    } else {
      throw `Could not find API method for key '${key}'.`;
    }
  }
}

export default new IpcMainBinder();
