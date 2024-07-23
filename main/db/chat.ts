import { eq, like } from "drizzle-orm";
import cuid from "cuid";
import { chats, messages } from "./schema";
import * as schema from "./schema";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export function Chat(db: BetterSQLite3Database<typeof schema>) {
  return {
    async getChats(search: string = "") {
      if (search !== "") {
        return db
          .select()
          .from(chats)
          .where(like(chats.title, `%${search}%`))
          .all();
      }
      return db.select().from(chats).all();
    },

    async getChat(id: string, includeMessages: boolean = false) {
      if (includeMessages) {
        const result = await db.query.chats.findFirst({
          where: eq(chats.id, id),
          with: { messages: true },
        });
        return { ...result, createdAt: new Date(result?.createdAt! * 1000) };
      } else {
        const result = await db.query.chats.findFirst({
          where: eq(chats.id, id),
        });
        return { ...result, createdAt: new Date(result?.createdAt! * 1000) };
      }
    },

    async addChat(chat: any) {
      const { title, data, id } = chat;
      const newChat = await db
        .insert(chats)
        .values({ title: title, data, id })
        .returning();

      if (chat.messages?.length > 0) {
        const chatId = newChat[0].id;
        const messagesData = chat.messages.map((m: any) => ({
          ...m,
          createdAt: Math.floor(
            (m.createdAt ? new Date(m.createdAt) : new Date()).getTime() / 1000,
          ),
          data: JSON.stringify(m.data || "{}"),
          chatId,
        }));
        await db.insert(messages).values(messagesData).returning();
      }

      return newChat[0];
    },

    async updateChat(chat: any) {
      const { id, title, data } = chat;
      const updatedChat = db
        .update(chats)
        .set({ title, data: JSON.stringify(data || []) })
        .where(eq(chats.id, id))
        .returning()
        .all();

      if (chat.messages?.length > 0) {
        const messagesData = chat.messages.map((m: any) => {
          const query = {
            role: m.role,
            content: m.content,
            createdAt: Math.floor(
              (m.createdAt ? new Date(m.createdAt) : new Date()).getTime() /
                1000,
            ),
            data: JSON.stringify(m.data || []),
            chatId: id,
          };
          return {
            create: { ...query, id: m.id },
            update: query,
          };
        });

        await Promise.all(
          messagesData.map(async (message) => {
            return db
              .insert(messages)
              .values(message.create)
              .onConflictDoUpdate({
                target: messages.id,
                set: message.update,
              });
          }),
        ).catch((e) => {
          console.log(e);
        });
      }

      return updatedChat[0];
    },

    async getChatHistory(id: string) {
      const messagesData = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, id));
      return messagesData.map((m) => ({
        ...m,
        data: JSON.parse(m.data || "{}"),
      }));
    },

    async deleteChat(id: string) {
      await db.delete(messages).where(eq(messages.chatId, id));
      return db.delete(chats).where(eq(chats.id, id)).returning().all();
    },
  };
}
