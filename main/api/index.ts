import express from "express";
import cors from "cors";
import { store } from "../store";
import { answer } from "./chat";

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
const apiKey = store.get("apiKey");

app.post("/api/chat", answer(apiKey));

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default server;
