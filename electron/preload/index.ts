import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";
import { ManifestAuthentication } from "../../src/plugintypes";
import { Api } from "./types";

// Custom APIs for renderer
const api: Api = {
  openLoginWindow: (auth: ManifestAuthentication, pluginId: string) => {
    ipcRenderer.invoke("open-login-window", auth, pluginId);
    ipcRenderer.on("login-window-response", (event, pluginId: string, headers: Record<string, string>, domainHeaders: Record<string, string>) => {
      window.postMessage({ type: "infogata-extension-notify-login", pluginId, headers, domainHeaders }, "*");
    });
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  (window as any).electron = electronAPI;
  (window as any).api = api;
}
