import { PrismaClient } from "@prisma/client";
import { Chat } from "./chat";
import { Message } from "./message";
import { Model } from "./model";
import { store } from "../store";

const prisma = new PrismaClient();

export const chat = Chat(prisma);
export const message = Message(prisma);
export const model = Model(prisma);

export async function migrateFromStore() {
  const messages = [];
  const chats = store.get("chats").map((c) => {
    c.messages.forEach((m) =>
      messages.push({
        ...m,
        data: JSON.stringify(m.data || "{}"),
        chatId: c.id,
      }),
    );
    return {
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
    };
  });
  if (chats.length) {
    const chatsCreated = await prisma.chat.createMany({
      data: chats,
    });
    console.log("chats created: ", chatsCreated);
    const messagesCreated = await prisma.message.createMany({
      data: messages,
    });
    console.log("messages created: ", messagesCreated);
  }
}
