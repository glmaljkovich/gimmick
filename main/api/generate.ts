import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText, streamToResponse } from "ai";
import { Request, Response } from "express";
import { search } from "./search";

async function basicAnswer(
  apiKey: string,
  messages: CoreMessage[],
  res: Response,
) {
  const openai = createOpenAI({ apiKey });
  const result = await streamText({
    model: openai("gpt-4o"),
    messages,
  });
  streamToResponse(result.toAIStream(), res);
}

type APIRequest = {
  messages: CoreMessage[];
  mode: "search" | "generate";
};

export const generate = (apiKey: string) =>
  async function (req: Request, res: Response) {
    try {
      const { messages, mode }: APIRequest = req.body;
      // Properly handle streaming response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      console.log("mode", mode);
      console.log("messages", messages);

      switch (mode) {
        case "search":
          await search(apiKey, messages, res);
          break;
        case "generate":
          await basicAnswer(apiKey, messages, res);
          break;
        default:
          await basicAnswer(apiKey, messages, res);
          break;
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
