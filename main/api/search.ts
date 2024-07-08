"use client";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Response } from "express";
import {
  CoreMessage,
  LangChainAdapter,
  StreamData,
  streamToResponse,
} from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

async function searchDDG(input: string) {
  const ddgSearch = new DuckDuckGoSearch({ maxResults: 4 });
  return await ddgSearch.invoke(input);
}

export async function executeChain(apiKey: string, input: string) {
  const llm = new ChatOpenAI({
    apiKey,
    model: "gpt-4o",
    temperature: 0,
  });
  const promptImprover = ChatPromptTemplate.fromTemplate(`
    Take this question from the user and modify it to accurately find search results on the web.
    Your output will be fed to DuckDuckGo. You can include keywords like linkedin, wikipedia, github, imdb, etc.
    Don't wrap the question in quotes.
    Question: "{input}"
    Improved DuckDuckGo search query:
  `);
  const improvedQuestion = await promptImprover
    .pipe(llm)
    .pipe(new StringOutputParser())
    .invoke({ input });
  const snippets = await searchDDG(improvedQuestion);
  const prompt = ChatPromptTemplate.fromTemplate(`
    You are a knowledgeable assistant.
    Based on the following snippets, please provide a detailed answer to the question: "{input}".
    At the end of each sentence (after the period) include a markdown reference to the snippet.
    Example: "The capital of France is Paris. [1](snippet.link 'snippet.title')"
    Snippets:
    {snippets}

    Answer:
  `);
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  try {
    const streamResult = await chain.stream({
      input,
      snippets,
    });
    return { answer: streamResult, snippets: snippets };
  } catch (error) {
    console.error(error);
  }
}

export const search = async (
  apiKey: string,
  messages: CoreMessage[],
  res: Response,
) => {
  const input = messages.at(-1).content as string;
  const { answer, snippets } = await executeChain(apiKey, input);

  const data = new StreamData();

  data.append({ snippets });

  const aiStream = LangChainAdapter.toAIStream(answer, {
    onFinal() {
      data.close();
      console.log("stream closed");
    },
  });

  streamToResponse(aiStream, res, {}, data);
};
