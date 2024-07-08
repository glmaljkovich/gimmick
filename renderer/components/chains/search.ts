"use client";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

const SearchResult = z
  .object({
    answer: z
      .string()
      .describe("Answer to the question, using the snippets provided"),
    sources: z.array(
      z.object({
        url: z.string().describe("URL of the source"),
        title: z.string().describe("Title of the source"),
        snippet: z.string().describe("Snippet of the source"),
      }),
    ),
  })
  .describe("Answer to a question with sources.");

export async function executeTool(apiKey: string, input: string) {
  const stream = createStreamableValue();

  // async function will run in the background and we will return immediately.
  // the stream will be updated with the results as they come in
  (async () => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful internet search assistant. Use the tools provided to best assist the user.`,
      ],
      ["human", "{input}"],
    ]);

    const llm = new ChatOpenAI({
      apiKey,
      model: "gpt-4o",
      temperature: 0,
    });

    const chain = prompt.pipe(
      llm.withStructuredOutput(SearchResult, {
        name: "search",
      }),
    );
    const streamResult = await chain.stream({
      input,
    });

    for await (const item of streamResult) {
      stream.update(item);
    }
    stream.done();
  })();

  return { streamData: stream.value };
}

export const search = async (input: string, apiKey: string) => {
  const { streamData } = await executeTool(apiKey, input);
  return streamData;
};
