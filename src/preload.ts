// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

const api = {
  production: {
    createOrder: (sku: string, qty: number) =>
      ipcRenderer.invoke("production:createOrder", sku, qty),
    completeOrder: (id: string, sku: string, qty: number) =>
      ipcRenderer.invoke("production:completeOrder", id, sku, qty),
    getStock: (sku: string) => ipcRenderer.invoke("production:getStock", sku),
  },
  sync: {
    syncNow: () => ipcRenderer.invoke("sync:now"),
    setToken: (token: string | null) => ipcRenderer.invoke("sync:setToken", token),
  },

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

  // Hardware (future)
  // printReceipt: (data: string) => ipcRenderer.invoke('hardware:print', data),
  // readSerial: (port: string) => ipcRenderer.invoke('hardware:serial', port),
};

contextBridge.exposeInMainWorld("electronAPI", api);
