import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText, streamToResponse } from "ai";
import { Request, Response } from "express";

export async function generate(
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
