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
import { format } from "date-fns";

async function searchDDG(input: string) {
  const ddgSearch = new DuckDuckGoSearch({
    maxResults: 4,
    searchOptions: { time: "y" },
  });
  return await ddgSearch.invoke(input);
}

export async function executeChain(
  apiKey: string,
  input: string,
  chats: CoreMessage[],
) {
  const llm = new ChatOpenAI({
    apiKey,
    model: "gpt-4o",
    temperature: 0,
  });
  // use date-fns
  const today = format(new Date(), "MMMM do, yyyy");
  const promptImprover = ChatPromptTemplate.fromTemplate(`
    Today is ${today}.
    Take this question from the user and modify it to accurately find search results on the web.
    Your output will be fed to DuckDuckGo's search bar.
    Don't wrap the question in quotes.

    Example:
    - Input: What happened yesterday in Brazil?
    - Assumption: Today is March 15, 2022.
    - Output: Brazil news 2022-03-15

    Example:
    - Input: Who is Satya Nadella?
    - Output: Satya Nadella bio wikipedia.org linkedin.com

    Context:
    {context}

    Question: "{input}"
    Improved DuckDuckGo search query:
  `);
  const context = chats
    .map((chat) => `${chat.role}: ` + chat.content)
    .join("\n");
  const improvedQuestion = await promptImprover
    .pipe(llm)
    .pipe(new StringOutputParser())
    .invoke({ input, context });
  console.log("improvedQuestion", improvedQuestion);
  const snippets = await searchDDG(improvedQuestion);
  const prompt = ChatPromptTemplate.fromTemplate(`
    You are a knowledgeable assistant.
    Based on the following snippets, please provide a detailed answer to the question: "{input}".
    At the end of each sentence (after the period) include a markdown reference to the snippet.
    Example: 'The capital of France is Paris. [1](snippet.link "snippet.title")'
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
  try {
    const input = messages.pop().content as string;
    const { answer, snippets } = await executeChain(apiKey, input, messages);

    const data = new StreamData();

    data.append({ snippets });

    const aiStream = LangChainAdapter.toAIStream(answer, {
      onFinal() {
        data.close();
        console.log("stream closed");
      },
    });

    streamToResponse(aiStream, res, {}, data);
  } catch (error) {
    console.error(error);
  }
};
