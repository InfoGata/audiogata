import { app, BrowserWindow } from "electron";
import * as path from "path";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

function UpsertKeyValue(obj: any, keyToChange: string, value: string[]) {
  const keyToChangeLower = keyToChange.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      // Done
      return;
    }
  }
  // Insert at end instead
  obj[keyToChange] = value;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  if (app.isPackaged) {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  } else {
    win.loadURL("http://localhost:3000/index.html");

    win.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        const { requestHeaders } = details;
        UpsertKeyValue(requestHeaders, "Access-Control-Allow-Origin", ["*"]);
        callback({ requestHeaders });
      }
    );

    win.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        const { responseHeaders } = details;
        UpsertKeyValue(responseHeaders, "Access-Control-Allow-Origin", ["*"]);
        UpsertKeyValue(responseHeaders, "Access-Control-Allow-Headers", ["*"]);
        callback({
          responseHeaders,
        });
      }
    );

    // Hot Reloading on 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        ".bin",
        "electron" + (process.platform === "win32" ? ".cmd" : "")
      ),
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }
}

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});
