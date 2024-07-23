import express from "express";
import cors from "cors";

import { answer } from "./chat";
import { uploadFiles, listFiles, deleteFiles } from "./files";
import { model } from "../db";
import { addChat, deleteChat, getChat, listChats, updateChat } from "./chats";
import {
  addTopic,
  addTopicToChat,
  deleteTopic,
  getChatsForTopic,
  getTopic,
  getTopicsForChat,
  listTopics,
  removeTopicFromChat,
} from "./topics";

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
model.getActiveModel().then((model) => {
  const apiKey = model.model.apiKey;
  // llm
  app.post("/api/chat", answer(apiKey));
  // files
  app.post("/api/files", listFiles());
  app.post("/api/files/upload", uploadFiles(apiKey));
  app.post("/api/files/delete", deleteFiles(apiKey));
  // chat history
  app.get("/api/chats", listChats);
  app.get("/api/chats/:id", getChat);
  app.get("/api/chats/:id/topics", getTopicsForChat);
  app.post("/api/chats", addChat);
  app.put("/api/chats/:id", updateChat);
  app.delete("/api/chats/:id", deleteChat);
  // topics
  app.get("/api/topics", listTopics);
  app.get("/api/topics/:id", getTopic);
  app.post("/api/topics", addTopic);
  app.delete("/api/topics/:id", deleteTopic);
  app.get("/api/topics/:id/chats", getChatsForTopic);
  app.post("/api/topics/assign", addTopicToChat);
  app.post("/api/topics/remove", removeTopicFromChat);
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default server;
