import path from "path";
import fs from "fs";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { initiliazeStore } from "./store";
import server from "./server";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  const devPath = `${app.getPath("userData")} (development)`;
  console.log("Development path:", devPath);
  if (!fs.existsSync(devPath)) {
    fs.mkdirSync(devPath, { recursive: true });
  }
  app.setPath("userData", devPath);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./ask");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/ask`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    server.close(() => {
      console.log("Server closed");
      app.quit();
    });
  } else {
    app.quit();
  }
});

// Handle store events
initiliazeStore(ipcMain);
