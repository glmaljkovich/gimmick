import { JSONValue } from "ai";
import Store from "electron-store";
import { chat, message, model } from "./db";

export interface IMessage {
  id: string;
  role: string;
  content: string;
  data?: JSONValue;
}

export interface IChat {
  title: string;
  id: string;
  messages: IMessage[];
  createdAt: string | Date;
  data?: JSONValue;
}

export interface IStore {
  chats: IChat[];
  apiKey: string;
}

const defaults: IStore = {
  chats: [],
  apiKey: "",
};

export const store = new Store<IStore>({ defaults, name: "chat" });

export const initiliazeStore = (ipcMain: Electron.IpcMain) => {
  // Chat listeners
  ipcMain.on("chat.get-chats", async (event) => {
    const chats = await chat.getChats();
    event.reply("chats", chats);
  });

  ipcMain.on("chat.get-chat", async (event, id) => {
    const c = await chat.getChat(id, true);
    event.reply("chat", c);
  });

  ipcMain.on("chat.add-chat", async (_event, arg) => {
    console.log("Adding chat", arg);
    const c = await chat.addChat(arg);
    console.log("Chat added", c);
  });

  ipcMain.on("chat.update-chat", async (_event, arg) => {
    const c = await chat.updateChat(arg);
  });

  ipcMain.on("chat.get-chat-history", async (event, arg) => {
    const { id } = arg;
    const messages = await chat.getChatHistory(id);
    event.reply("chat-history", messages);
  });

  ipcMain.on("chat.delete-chat", async (event, id) => {
    const c = await chat.deleteChat(id);
    event.reply("chat-deleted", id);
  });

  // Model listeners
  ipcMain.on("model.set-api-key", async (_event, arg) => {
    const { modelId, apiKey } = arg;
    console.log("Setting API Key", modelId, apiKey);
    const c = await model.setApiKey(modelId, apiKey);
    console.log("API Key set", c);
  });

  ipcMain.on("model.get-api-key", async (event) => {
    const activeModel = await model.getActiveModel(true);
    const apiKey = activeModel?.model?.apiKey;
    event.reply("api-key", apiKey);
  });

  ipcMain.on("model.get-active-model", async (event) => {
    console.log("Getting active model");
    const activeModel = await model.getActiveModel(true);
    console.log("Active model", activeModel);
    event.reply("active-model", activeModel);
  });

  ipcMain.on("model.get-models", async (event) => {
    const models = await model.getModels();
    event.reply("models", models);
  });
};
