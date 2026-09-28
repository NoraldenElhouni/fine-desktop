import { contextBridge, ipcRenderer } from "electron";

const api = {
  // App lifecycle
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),

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

  // Auto-updater (electron-updater, GitHub releases)
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  installUpdateAndRestart: () => ipcRenderer.invoke("update:install-and-restart"),
  onUpdateStatus: (cb: (status: string, version?: string) => void) => {
    const handler = (_: unknown, status: string, version?: string) => cb(status, version);
    ipcRenderer.on("update:status", handler);
    return () => ipcRenderer.removeListener("update:status", handler);
  },
  onUpdateProgress: (cb: (data: { percent: number; speed?: string; transferred?: number; total?: number }) => void) => {
    const handler = (_: unknown, data: any) => cb(data);
    ipcRenderer.on("update:progress", handler);
    return () => ipcRenderer.removeListener("update:progress", handler);
  },
  onUpdateDownloaded: (cb: (version?: string) => void) => {
    const handler = (_: unknown, version?: string) => cb(version);
    ipcRenderer.on("update:downloaded", handler);
    return () => ipcRenderer.removeListener("update:downloaded", handler);
  },
  onUpdateError: (cb: (errorMsg: string) => void) => {
    const handler = (_: unknown, msg: string) => cb(msg);
    ipcRenderer.on("update:error", handler);
    return () => ipcRenderer.removeListener("update:error", handler);
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
