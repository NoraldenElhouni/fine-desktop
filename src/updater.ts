import { app, BrowserWindow, ipcMain, shell } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

let downloadedInstallerPath: string | null = null;

export function setupUpdater(getMainWindow: () => BrowserWindow | null) {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
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
    getMainWindow()?.webContents.send("update:status", "available");
    autoUpdater.downloadUpdate().catch((err) => {
      log.error("Failed to start downloadUpdate:", err);
      getMainWindow()?.webContents.send(
        "update:error",
        err.message || "Failed to start update download"
      );
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info.version);
    getMainWindow()?.webContents.send("update:status", "not-available");
  });

  autoUpdater.on("download-progress", (progressObj) => {
    const percent = Math.round(progressObj.percent);
    const speedMb = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(1) + " MB/s";
    getMainWindow()?.webContents.send("update:progress", {
      percent,
      speed: speedMb,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on("update-downloaded", () => {
    log.info("Update successfully downloaded via autoUpdater");
    getMainWindow()?.webContents.send("update:downloaded");
  });

  autoUpdater.on("error", (err) => {
    log.error("autoUpdater error:", err);
    getMainWindow()?.webContents.send(
      "update:error",
      err.message || "Update retrieval error"
    );
  });

  // IPC Handlers
  ipcMain.handle("update:start-auto-update", async (_, options?: { downloadUrl?: string }) => {
    try {
      if (app.isPackaged) {
        log.info("Initiating autoUpdater check & download in production");
        await autoUpdater.checkForUpdates();
        return { success: true };
      } else {
        log.info("App is not packaged (dev mode). Simulating or using direct fallback");
        if (options?.downloadUrl) {
          return await downloadDirectFile(options.downloadUrl, getMainWindow);
        }
        // Dev simulation
        simulateDevDownload(getMainWindow);
        return { success: true, message: "Dev mode update simulated" };
      }
    } catch (err: any) {
      log.error("Error in update:start-auto-update:", err);
      if (options?.downloadUrl) {
        log.info("Falling back to direct file download from:", options.downloadUrl);
        return await downloadDirectFile(options.downloadUrl, getMainWindow);
      }
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle("update:install-and-restart", async () => {
    if (downloadedInstallerPath && fs.existsSync(downloadedInstallerPath)) {
      log.info("Launching downloaded installer binary:", downloadedInstallerPath);
      await shell.openPath(downloadedInstallerPath);
      app.quit();
      return;
    }

    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (err) {
      log.error("Failed to quitAndInstall:", err);
      app.relaunch();
      app.quit();
    }
  });

  ipcMain.handle("update:download-direct-installer", async (_, { url }: { url: string }) => {
    return await downloadDirectFile(url, getMainWindow);
  });
}

function simulateDevDownload(getMainWindow: () => BrowserWindow | null) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    getMainWindow()?.webContents.send("update:progress", {
      percent: progress,
      speed: "4.2 MB/s",
    });
    if (progress >= 100) {
      clearInterval(interval);
      getMainWindow()?.webContents.send("update:downloaded");
    }
  }, 600);
}

function downloadDirectFile(
  fileUrl: string,
  getMainWindow: () => BrowserWindow | null
): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    const ext = process.platform === "win32" ? ".exe" : process.platform === "darwin" ? ".dmg" : ".deb";
    const destPath = path.join(app.getPath("temp"), `FineERP-Update${ext}`);
    downloadedInstallerPath = destPath;

    const followRedirects = (currentUrl: string, depth = 0) => {
      if (depth > 5) {
        const msg = "Too many redirects while downloading update";
        getMainWindow()?.webContents.send("update:error", msg);
        resolve({ success: false, message: msg });
        return;
      }

      const client = currentUrl.startsWith("https:") ? https : http;
      client.get(currentUrl, { headers: { "User-Agent": "Fine-ERP-Desktop-Updater" } }, (res) => {
        if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          return followRedirects(res.headers.location, depth + 1);
        }

        if (res.statusCode !== 200) {
          const msg = `Server returned HTTP ${res.statusCode} for update file`;
          getMainWindow()?.webContents.send("update:error", msg);
          resolve({ success: false, message: msg });
          return;
        }

        const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
        let transferredBytes = 0;
        let lastTime = Date.now();
        let lastBytes = 0;
        let speed = "0 MB/s";

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);

        res.on("data", (chunk) => {
          transferredBytes += chunk.length;
          const now = Date.now();
          if (now - lastTime >= 500) {
            const bytesDiff = transferredBytes - lastBytes;
            const timeDiffSec = (now - lastTime) / 1000;
            speed = (bytesDiff / timeDiffSec / 1024 / 1024).toFixed(1) + " MB/s";
            lastTime = now;
            lastBytes = transferredBytes;
          }

          const percent = totalBytes > 0 ? Math.round((transferredBytes / totalBytes) * 100) : 50;
          getMainWindow()?.webContents.send("update:progress", {
            percent,
            speed,
            transferred: transferredBytes,
            total: totalBytes,
          });
        });

        fileStream.on("finish", () => {
          fileStream.close();
          getMainWindow()?.webContents.send("update:downloaded");
          resolve({ success: true });
        });

        fileStream.on("error", (err) => {
          fs.unlink(destPath, () => {});
          getMainWindow()?.webContents.send("update:error", err.message);
          resolve({ success: false, message: err.message });
        });
      }).on("error", (err) => {
        getMainWindow()?.webContents.send("update:error", err.message);
        resolve({ success: false, message: err.message });
      });
    };

    followRedirects(fileUrl);
  });
}
