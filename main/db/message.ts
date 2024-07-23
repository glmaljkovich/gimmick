import { eq } from "drizzle-orm";
import { messages } from "./schema";
import * as schema from "./schema";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export function Message(db: BetterSQLite3Database<typeof schema>) {
  return {
    async getMessages() {
      return db.select().from(messages).all();
    },

    async getMessage(id: string) {
      return db.select().from(messages).where(eq(messages.id, id)).all();
    },

    async addMessage(message: any) {
      return db.insert(messages).values(message).returning().all();
    },

    async updateMessage(message: any) {
      const { id, ...data } = message;
      return db
        .update(messages)
        .set(data)
        .where(eq(messages.id, id))
        .returning()
        .all();
    },

    async deleteMessage(id: string) {
      return db.delete(messages).where(eq(messages.id, id)).returning().all();
    },
  };
}
