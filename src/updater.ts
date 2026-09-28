import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

export function setupUpdater(getMainWindow: () => BrowserWindow | null) {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  try {
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "NoraldenElhouni",
      repo: "fine-desktop",
    });
  } catch (err) {
    log.warn("Failed to set autoUpdater feed URL:", err);
  }

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
    getMainWindow()?.webContents.send("update:status", "checking");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    getMainWindow()?.webContents.send("update:status", "available", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    getMainWindow()?.webContents.send("update:status", "not-available");
  });

  autoUpdater.on("download-progress", (progress) => {
    getMainWindow()?.webContents.send("update:progress", {
      percent: Math.round(progress.percent),
      speed: (progress.bytesPerSecond / 1024 / 1024).toFixed(1) + " MB/s",
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info.version);
    getMainWindow()?.webContents.send("update:downloaded", info.version);
  });

  autoUpdater.on("error", (err) => {
    log.error("autoUpdater error:", err);
    getMainWindow()?.webContents.send("update:error", err.message || "Update error");
  });

  ipcMain.handle("update:check", async () => {
    if (!app.isPackaged) {
      log.info("Skipping update check in dev mode (not packaged)");
      return { success: false, message: "Updates are only checked in packaged builds" };
    }
    try {
      await autoUpdater.checkForUpdates();
      return { success: true };
    } catch (err) {
      log.error("update:check failed:", err);
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle("update:install-and-restart", () => {
    autoUpdater.quitAndInstall(false, true);
  });

  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch((err) => log.error("Initial update check failed:", err));
    setInterval(() => {
      autoUpdater.checkForUpdates().catch((err) => log.error("Periodic update check failed:", err));
    }, CHECK_INTERVAL_MS);
  }
}
