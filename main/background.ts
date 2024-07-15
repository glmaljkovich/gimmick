import path from "path";
import fs from "fs";
import { app, ipcMain, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { initiliazeStore } from "./store";
import server from "./api";
import { migrateFromStore } from "./db";

const isProd = process.env.NODE_ENV === "production";

// set user folder
if (isProd) {
  serve({ directory: "app" });
} else {
  const devPath = app.getPath("userData");
  console.log("Development path:", devPath);
  if (!fs.existsSync(devPath)) {
    fs.mkdirSync(devPath, { recursive: true });
  }
}
// setup db path
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "gimmick.db");
process.env.DATABASE_URL = `file:${dbPath}`;

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./ask");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/ask`);
    // mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // stop express server first
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

// Handle file selection
ipcMain.on("select-files", async (event) => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });
  event.reply("file-selected", files.filePaths);
});
