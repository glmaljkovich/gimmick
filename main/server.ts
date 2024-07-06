import { createServer, IncomingMessage, ServerResponse } from "http";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, streamToResponse } from "ai";
import { store } from "./store";
import express from "express";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

app.post("/api/stream", async (req, res) => {
  try {
    const { messages } = req.body;
    const openai = createOpenAI({ apiKey: store.get("apiKey") });
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
    });

    // Properly handle streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    streamToResponse(result.toAIStream(), res);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
