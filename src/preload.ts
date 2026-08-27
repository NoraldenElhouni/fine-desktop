import { contextBridge, ipcRenderer } from "electron";

const api = {
  // App lifecycle
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  checkForUpdates: () => ipcRenderer.invoke("app:check-updates"),

  // Window controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  setFullscreen: (flag: boolean) =>
    ipcRenderer.send("window:set-fullscreen", flag),

  // Network
  onNetworkChange: (cb: (online: boolean) => void) =>
    ipcRenderer.on("network:change", (_, online) => cb(online)),

  // Native notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.send("notification:show", { title, body }),
};

contextBridge.exposeInMainWorld("electronAPI", api);
