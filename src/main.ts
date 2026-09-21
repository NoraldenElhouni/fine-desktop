import { app, BrowserWindow, shell, session, nativeImage } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";

app.setName("Fine ERP");
process.title = "Fine ERP";

if (process.platform === "win32") {
  app.setAppUserModelId("Fine ERP");
}
if (process.platform === "linux") {
  app.setDesktopName("Fine ERP.desktop");
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const getAppIcon = () => {
  const possiblePaths = [
    path.resolve(__dirname, "../../assets/icons/icon.png"),
    path.resolve(__dirname, "../assets/icons/icon.png"),
    path.resolve(app.getAppPath(), "../assets/icons/icon.png"),
    path.resolve(app.getAppPath(), "assets/icons/icon.png"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) {
        return img;
      }
    }
  }
  return undefined;
};

const createWindow = () => {
  const appIcon = getAppIcon();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Fine ERP",
    icon: appIcon,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  if (appIcon && process.platform === "linux") {
    mainWindow.setIcon(appIcon);
  }

  mainWindow.show();
  mainWindow.maximize();
  mainWindow.focus();

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow.isDestroyed() && !mainWindow.isMaximized()) {
      mainWindow.maximize();
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow.isDestroyed() && !mainWindow.isMaximized()) {
      mainWindow.maximize();
    }
  });

  mainWindow.webContents.on("devtools-opened", () => {
    setImmediate(() => {
      if (!mainWindow.isDestroyed() && !mainWindow.isMaximized()) {
        mainWindow.maximize();
      }
    });
  });

  // Lock down window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // if its development mode, open dev tools
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
};

// Set up security headers & CSP
app.on("ready", () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // Only apply CSP to local development and local file URLs
    const isLocal =
      details.url.startsWith("http://localhost:") ||
      details.url.startsWith("file://");

    if (!isLocal) {
      callback({ responseHeaders: details.responseHeaders });
      return;
    }

    const responseHeaders = { ...details.responseHeaders };

    // Set a strict CSP for the renderer
    responseHeaders["Content-Security-Policy"] = [
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http: https: ws:",
    ];

    callback({ responseHeaders });
  });
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
