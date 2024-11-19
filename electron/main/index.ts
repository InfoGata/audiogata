import { is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, components, ipcMain } from "electron";
import { join } from "path";
import { ManifestAuthentication } from "../../src/plugintypes";

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
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      sandbox: false,
    },
  });

  ipcMain.handle("open-login-window", (event, auth: ManifestAuthentication, pluginId: string) => {
    const loginWindow = new BrowserWindow({
      width: 1024,
      height: 768,
    });
    loginWindow.loadURL(auth.loginUrl);
    const loginInfo = {
      foundCompletionUrl: !auth.completionUrl,
      foundHeaders: !auth.headersToFind,
      foundDomainHeaders: !auth.domainHeadersToFind,
      foundCookies: !auth.cookiesToFind,
      headers: {},
      domainHeaders: {}
    }
    loginWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      const { requestHeaders, url } = details;
      const detailsUrl = new URL(url);
      const urlHost = detailsUrl.host;
      const headerMap = new Map(Object.entries(requestHeaders));

      if (auth.completionUrl && !loginInfo.foundCompletionUrl) {
        if (url === auth.completionUrl) {
          loginInfo.foundCompletionUrl = true;
        } else if (auth.completionUrl.endsWith("?")) {
          const urlToCheck = auth.completionUrl.slice(0, -2);
          const originAndPath = `${detailsUrl.origin}${detailsUrl.pathname}`;
          loginInfo.foundCompletionUrl = urlToCheck === originAndPath;
        }
      }

      if (auth.cookiesToFind && !loginInfo.foundCookies) {
        const cookies = headerMap.get("Cookie");
        if (cookies) {
          const cookieMap = new Map(
            cookies.split(";")
            .map(cookie => cookie.trim().split("="))
            .map(cookie => [cookie[0], cookie[1]])
          );

          loginInfo.foundCookies = auth.cookiesToFind.every(cookie => cookieMap.has(cookie));
        }
      }

      if (auth.domainHeadersToFind && !loginInfo.foundDomainHeaders) {
        const domainToSearch = Object.keys(auth.domainHeadersToFind).find((d) =>
          urlHost.endsWith(d)
        );

      if (domainToSearch && !loginInfo.domainHeaders[domainToSearch]) {
        const domainHeaders = auth.domainHeadersToFind[domainToSearch];
        const foundDomainHeaders = domainHeaders.every((dh) =>
          headerMap.has(dh)
        );
          if (foundDomainHeaders) {
            loginInfo.domainHeaders[domainToSearch] = {};
            for (const header of domainHeaders) {
              loginInfo.domainHeaders[domainToSearch][header] =
                headerMap.get(header);
            }
          }
        }

        if (Object.keys(loginInfo.domainHeaders).length === Object.keys(auth.domainHeadersToFind).length) {
          loginInfo.foundDomainHeaders = true;
        }
      }

      if (auth.headersToFind && !loginInfo.foundHeaders) {
        loginInfo.foundHeaders = auth.headersToFind.every(header => headerMap.has(header));
        if (loginInfo.foundHeaders) {
          for (const header of auth.headersToFind) {
            loginInfo.headers[header] = headerMap.get(header);
          }
        }
      }

      const { foundCompletionUrl, foundHeaders, foundDomainHeaders, foundCookies } = loginInfo;
      if (foundCompletionUrl && foundHeaders && foundDomainHeaders && foundCookies) {
        mainWindow.webContents.send("login-window-response",
          pluginId,
          loginInfo.headers,
          loginInfo.domainHeaders);
        loginWindow.destroy();
      }
      callback({ requestHeaders });
    });
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const { requestHeaders } = details;
      UpsertKeyValue(requestHeaders, "Access-Control-Allow-Origin", ["*"]);
      callback({ requestHeaders });
    }
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      const { responseHeaders } = details;
      if (responseHeaders) {
        // If credentials == "true", Access-Control-Allow-Origin cannot be "*"
        // So only set it if that header isn't there
        const credentialsHeader =
          responseHeaders["access-control-allow-credentials"];
        if (!credentialsHeader) {
          UpsertKeyValue(responseHeaders, "Access-Control-Allow-Origin", ["*"]);
          UpsertKeyValue(responseHeaders, "Access-Control-Allow-Headers", [
            "*",
          ]);
        }
      }
      callback({
        responseHeaders,
      });
    }
  );

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  await components.whenReady();

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
