import Store from "electron-store";

export interface IMessage {
  id: string;
  role: string;
  content: string;
}

export interface IChat {
  title: string;
  id: string;
  messages: IMessage[];
  createdAt: string;
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
  ipcMain.on("get-chats", (event) => {
    event.reply("chats", store.get("chats"));
  });

  ipcMain.on("get-chat", (event, arg) => {
    const chats = store.get("chats");
    const chat = chats.find((chat) => chat.id === arg);
    event.reply("chat", chat);
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
    chats[index] = { ...chats[index], ...arg };
    store.set("chats", chats);
  });

  ipcMain.on("get-chat-history", (event, arg) => {
    const chats = store.get("chats");
    const { id } = arg;
    const chat = chats.find((chat) => chat.id === id);
    console.log("chat history", chat?.messages);
    event.reply("chat-history", chat?.messages);
  });

  ipcMain.on("delete-chat", (_event, arg) => {
    const chats = store.get("chats");
    const index = chats.findIndex((chat) => chat.id === arg);
    chats.splice(index, 1);
    store.set("chats", chats);
  });

  ipcMain.on("set-api-key", (_event, arg) => {
    store.set("apiKey", arg);
  });

  ipcMain.on("get-api-key", (event) => {
    event.reply("api-key", store.get("apiKey"));
  });
};
