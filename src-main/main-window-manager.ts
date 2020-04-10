import { BrowserWindow } from "electron";
import * as url from "url";
import * as path from "path";
import * as fs from "fs-extra";

let mainWindow: BrowserWindow | undefined;

function showNotFound(mainWindow: any, lookups: Array<string>) {
  let lookupsHtml = lookups.map(x => `<li>${x}</li>`).join("");
  mainWindow.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
    <h1>Oops...</h1>
    <p>The file <b>index.html</b> was not found!</p>
    <p>We tried the following paths:</p>
    <ul>${lookupsHtml}</ul>
</body>
</html>`)
  );
}

function showTesting(mainWindow: BrowserWindow) {
  mainWindow.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Testing</h1>
<p>Testing...</p>
</body>
</html>`)
  );
}

function showLookingForServer(mainWindow: BrowserWindow, port: string) {
  mainWindow.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Waiting for Development Server</h1>
<p>Waiting for React development server in port ${port}...</p>
<p>Have you started it?</p>
</body>
</html>`)
  );
}

function showInvalidDevelopmentUrl(url?: string) {
  if (mainWindow == null) return;
  mainWindow.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Invalid Development Server URL</h1>
<p>The provided URL (${url || "EMPTY"}) does not match the required pattern.</p>
<p>Please, fix this and try again.</p>
</body>
</html>`)
  );
}

function createWindow() {
  let icon;
  if (process.env.REACT_DEV_URL) icon = path.normalize(__dirname + "/../public/icon.png");

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    backgroundColor: "#ffffff",
    minWidth: 1024,
    webPreferences: {
      nodeIntegration: true
    },
    //webPreferences:{webSecurity:false },
    icon
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.setMenuBarVisibility(false);

  if (process.env.REACT_DEV_URL) {
    //DEVELOPMENT SERVER

    let url = process.env.REACT_DEV_URL;
    const urlWithPortMatch = url.match(/:([0-9]{4})$/);
    if (urlWithPortMatch == null) {
      showInvalidDevelopmentUrl(url);
    } else {
      let port = urlWithPortMatch[1];
      showLookingForServer(mainWindow, port);

      const net = require("net");
      const client = new net.Socket();
      const tryConnection = () =>
        client.connect({ port: port }, () => {
          client.end();
          if (mainWindow) mainWindow.loadURL(url);
        });
      client.on("error", (error: Error) => {
        setTimeout(tryConnection, 1000);
      });
      tryConnection();
    }
  } else {
    //LOOKING FOR INDEX.HTML

    let lookups = [
      path.normalize(path.join(__dirname, "/../index.html")), //works in production
      path.normalize(path.join(__dirname, "../build/index.html")) //works in development after react_build
    ];

    let indexFile = null;
    for (let i = 0; i < lookups.length; i++) {
      let lookup = lookups[i];
      if (fs.existsSync(lookup)) {
        indexFile = lookup;
        break;
      }
    }
    if (indexFile) {
      mainWindow.loadURL(url.format({ pathname: indexFile, protocol: "file:", slashes: true }));
    } else {
      showNotFound(mainWindow, lookups);
    }
  }

  mainWindow.on("closed", function() {
    mainWindow = undefined; //clear reference
  });

  var handleRedirect = (e: any, url: string) => {
    if (!/\/\/localhost/.test(url)) {
      e.preventDefault();
      require("electron").shell.openExternal(url);
    }
  };

  mainWindow.webContents.on("will-navigate", handleRedirect);
  mainWindow.webContents.on("new-window", handleRedirect);

  //mainWindow.webContents.openDevTools();
}

export default {
  getCurrentInstance: function() {
    return mainWindow;
  },
  getCurrentInstanceOrNew: function() {
    let instance = this.getCurrentInstance();

    if (instance) {
      return instance;
    }

    createWindow();
    return mainWindow;
  }
};
