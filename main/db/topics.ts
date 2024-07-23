import { and, eq, inArray } from "drizzle-orm";
import { topics, chatTopics } from "./schema";
import * as schema from "./schema";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export function Topic(db: BetterSQLite3Database<typeof schema>) {
  return {
    async getTopics() {
      return db.select().from(topics).all();
    },

    async getTopic(id: number) {
      return db.select().from(topics).where(eq(topics.id, id)).all();
    },

    async addTopic(model: any) {
      return db.insert(topics).values(model).returning().all();
    },

    async updateTopic(model: any) {
      const { id, ...data } = model;
      return db
        .update(topics)
        .set(data)
        .where(eq(topics.id, id))
        .returning()
        .all();
    },

    async deleteTopic(id: number) {
      return db.delete(topics).where(eq(topics.id, id)).returning().all();
    },

    async addTopicToChat(topicId: number, chatId: string) {
      return db
        .insert(schema.chatTopics)
        .values({ topicId, chatId })
        .returning()
        .all();
    },

    async removeTopicFromChat(topicId: number, chatId: string) {
      return db
        .delete(schema.chatTopics)
        .where(
          and(
            eq(schema.chatTopics.topicId, topicId),
            eq(schema.chatTopics.chatId, chatId),
          ),
        )
        .returning()
        .all();
    },

    async getChatsForTopic(topicId: number) {
      const chatIds = db
        .select({ chatId: chatTopics.chatId })
        .from(chatTopics)
        .where(eq(chatTopics.topicId, topicId))
        .all()
        .map((c) => c.chatId);
      return db
        .select()
        .from(schema.chats)
        .where(inArray(schema.chats.id, chatIds))
        .all();
    },

    async getTopicsForChat(chatId: string) {
      const topic = db
        .select({ topicId: chatTopics.topicId })
        .from(chatTopics)
        .where(eq(chatTopics.chatId, chatId))
        .all()
        .map((c) => c.topicId)[0];
      return db.select().from(schema.topics).where(eq(topics.id, topic)).all();
    },
  };
}
