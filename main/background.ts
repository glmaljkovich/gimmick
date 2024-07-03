import path from "path";
import fs from "fs";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { store } from "./store";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  const devPath = `${app.getPath("userData")} (development)`;
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
  app.quit();
});

// Handle store events

ipcMain.on("get-chats", (event) => {
  event.reply("chats", store.get("chats"));
});

ipcMain.on("add-chat", (_event, arg) => {
  const chats = store.get("chats");
  console.log("received chat", arg);
  chats.push(arg);
  store.set("chats", chats);
});

ipcMain.on("update-chat", (_event, arg) => {
  const chats = store.get("chats");
  const index = chats.findIndex((chat) => chat.id === arg.id);
  chats[index] = arg;
  store.set("chats", chats);
});

ipcMain.on("get-chat-history", (event, arg) => {
  const chats = store.get("chats");
  const { id } = arg;
  const chat = chats.find((chat) => chat.id === id);
  console.log("chat history", chat.messages);
  event.reply("chat-history", chat.messages);
});

ipcMain.on("delete-chat", (_event, arg) => {
  const chats = store.get("chats");
  const index = chats.findIndex((chat) => chat.id === arg);
  chats.splice(index, 1);
  store.set("chats", chats);
});
