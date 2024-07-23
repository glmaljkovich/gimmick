import { Request, Response } from "express";
import { CoreMessage } from "ai";
import { generate } from "./generate";
import { search } from "./search";
import { searchFiles } from "./fileSearch";

type APIRequest = {
  messages: CoreMessage[];
  mode: "search" | "generate" | "files";
  files?: string[];
  contentFilter?: "academic" | "news" | "social";
};

export const answer = (apiKey: string) =>
  async function (req: Request, res: Response) {
    try {
      const { messages, mode, files }: APIRequest = req.body;
      // Properly handle streaming response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      console.log("mode", mode);

      switch (mode) {
        case "search":
          await search(apiKey, messages, res);
          break;
        case "generate":
          await generate(apiKey, messages, res);
          break;
        case "files":
          await searchFiles(apiKey, messages, files, res);
          break;
        default:
          await generate(apiKey, messages, res);
          break;
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
