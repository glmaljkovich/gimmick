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
}

const defaults: IStore = {
  chats: [],
};

export const store = new Store<IStore>({ defaults, name: "chat" });
