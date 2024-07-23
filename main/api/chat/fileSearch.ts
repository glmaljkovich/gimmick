import {
  CoreMessage,
  LangChainAdapter,
  StreamData,
  streamToResponse,
} from "ai";
import {
  VectorStoreIndex,
  storageContextFromDefaults,
  TextNode,
  SimpleVectorStore,
} from "llamaindex";
import { Response } from "express";
import { app } from "electron";
import path from "path";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function createChain() {}

export async function searchFiles(
  apiKey: string,
  messages: CoreMessage[],
  files: string[],
  res: Response,
) {
  try {
    process.env.OPENAI_API_KEY = apiKey;
    const input = messages.pop().content as string;
    console.log("input", input);
    console.log("files", files);

    const index = await loadPersistentIndex();

    const data = new StreamData();

    console.log("Searching index");
    // search the index
    const { response, metadata, sourceNodes } = await index
      .asQueryEngine({
        similarityTopK: 4,
        preFilters: {
          filters: files.map((f) => ({
            key: "file_path",
            value: f,
            operator: "==",
          })),
        },
      })
      .query({ query: input });
    // create snippets
    const snippets = sourceNodes.map((doc) => ({
      type: "file",
      link: doc.node.metadata["file_path"],
      title: doc.node.metadata["file_name"],
      snippet: (doc.node as TextNode).text.slice(0, 150),
    }));
    console.log("Snippets: ", snippets);
    // send snippets early
    data.append({ snippets: JSON.stringify(snippets) });
    console.log("Query engine answer: ", response);
    console.log(
      "Query engine metadata: ",
      sourceNodes.map((node) => node.node.metadata),
    );
    // console.log("Query engine sourceNodes: ", sourceNodes);

    // format to langchain
    const llm = new ChatOpenAI({
      apiKey,
      model: "gpt-4o",
      temperature: 0,
    });
    const prompt = ChatPromptTemplate.fromTemplate(`
    Based on the following search result from the snippets, please provide a detailed answer to the question: "{input}".
    At the end of each sentence (after the period) include a markdown reference to the snippet.
    Example:
      - snippets: [{{"title": "Capitals of the world", link: "https://wikipedia.com", snippet: "France: Paris, Germany: Berlin..."}}]
      - output: "The capital of France is Paris. [1](https://wikipedia.com 'Capitals of the world')"

    Search Result:
    {response}

    Snippets:
    {snippets}

    Answer:
  `);
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const streamResult = await chain.stream({
      input,
      snippets: JSON.stringify(snippets),
      response,
    });

    const aiStream = LangChainAdapter.toAIStream(streamResult, {
      onFinal() {
        data.close();
        console.log("stream closed");
      },
    });

    streamToResponse(aiStream, res, {}, data);
  } catch (error) {
    console.error(error);
  }
}

async function loadPersistentIndex() {
  console.log("loading index");
  const vectorDbPath = path.join(app.getPath("userData"), "vectorstore");
  console.log("vectorDbPath", vectorDbPath);
  const store = await SimpleVectorStore.fromPersistDir(vectorDbPath);
  const storageContext = await storageContextFromDefaults({
    persistDir: vectorDbPath,
    vectorStore: store,
  });

  return VectorStoreIndex.init({
    storageContext,
    logProgress: true,
  });
}
