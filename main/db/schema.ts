import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const messages = sqliteTable("Message", {
  id: text("id").primaryKey(),
  role: text("role"),
  content: text("content"),
  createdAt: integer("createdAt").default(sql`(strftime('%s','now'))`),
  data: text("data"),
  chatId: text("chatId").references(() => chats.id, { onDelete: "cascade" }),
});

export const chats = sqliteTable("Chat", {
  id: text("id").primaryKey().unique(),
  title: text("title"),
  createdAt: integer("createdAt").default(sql`(strftime('%s','now'))`),
  data: text("data"),
});

// Define relations for the Chat table
export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}));

// Define relations for the Message table
export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, { fields: [messages.chatId], references: [chats.id] }),
}));

export const models = sqliteTable("Model", {
  id: text("id").primaryKey(),
  provider: text("provider"),
  name: text("name"),
  apiKey: text("apiKey"),
});

export const activeModels = sqliteTable("ActiveModel", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: text("modelId")
    .references(() => models.id)
    .unique(),
});

// Define relations for the models
export const modelsRelations = relations(models, ({ many }) => ({
  activeModels: many(activeModels),
}));

// Define relations for the activeModels
export const activeModelsRelations = relations(activeModels, ({ one }) => ({
  model: one(models, {
    fields: [activeModels.modelId],
    references: [models.id],
  }),
}));

export const files = sqliteTable("File", {
  id: text("id").primaryKey(),
  name: text("name"),
  path: text("path"),
  uploadedAt: integer("uploadedAt").default(sql`(strftime('%s','now'))`),
  snippet: text("snippet"),
});

export const topics = sqliteTable("Topic", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  color: text("color"),
});

// lookup table for chat topics
export const chatTopics = sqliteTable(
  "ChatTopics",
  {
    topicId: integer("topicId").references(() => topics.id),
    chatId: text("chatId").references(() => chats.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.topicId, table.chatId] }),
    };
  },
);
