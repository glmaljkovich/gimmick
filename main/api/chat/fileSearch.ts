import {
  CoreMessage,
  LangChainAdapter,
  StreamData,
  streamToResponse,
} from "ai";
import fs from "fs/promises";
import {
  VectorStoreIndex,
  Document,
  DocxReader,
  PDFReader,
  TextFileReader,
  storageContextFromDefaults,
  SimpleDocumentStore,
  Metadata,
  TextNode,
} from "llamaindex";
import { Request, Response } from "express";
import { app } from "electron";
import path from "path";

import { BaseRetriever } from "@langchain/core/retrievers";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { FilterVectorStore } from "./FilterVectorStore";

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
    let documents: Document[] = [];
    if (files) {
      const filesdata = await Promise.all(
        files.map(async (file) => loadDocument(file)),
      );
      documents = filesdata.flat();
    }

    const index = await updatePersistentIndex(documents);

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
            filterType: "ExactMatch",
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
    console.log("Query engine sourceNodes: ", sourceNodes);

    // format to langchain
    const llm = new ChatOpenAI({
      apiKey,
      model: "gpt-4o",
      temperature: 0,
    });
    const prompt = ChatPromptTemplate.fromTemplate(`
    Based on the following search result from the snippets, please provide a detailed answer to the question: "{input}".
    At the end of each sentence (after the period) include a markdown reference to the snippet.
    Example: "The capital of France is Paris. [1](snippet.link 'snippet.title')"

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

async function loadDocument(filePath: string) {
  const mimeType = filePath.split(".").pop();
  console.log(`Processing uploaded document of type: ${mimeType}`);
  switch (mimeType) {
    case "pdf": {
      const pdfReader = new PDFReader();
      return await pdfReader.loadData(filePath);
    }
    case "txt": {
      const textReader = new TextFileReader();
      return await textReader.loadData(filePath);
    }
    case "json": {
      const textReader = new TextFileReader();
      return await textReader.loadData(filePath);
    }
    case "docx": {
      const docxReader = new DocxReader();
      return await docxReader.loadData(filePath);
    }
    default:
      throw new Error(`Unsupported document type: ${mimeType}`);
  }
}

export async function getDataSource() {
  const vectorDbPath = path.join(app.getPath("userData"), "vectorstore");
  const storageContext = await storageContextFromDefaults({
    persistDir: vectorDbPath,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    return null;
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}

async function updatePersistentIndex(documents: Document[]) {
  console.log("updating index");
  const vectorDbPath = path.join(app.getPath("userData"), "vectorstore");
  console.log("vectorDbPath", vectorDbPath);
  const store = await FilterVectorStore.fromPersistDir(vectorDbPath);
  const storageContext = await storageContextFromDefaults({
    persistDir: vectorDbPath,
    vectorStore: store,
  });

  if (documents.length > 0) {
    console.log("Adding documents to index");
    const index = await VectorStoreIndex.init({
      storageContext,
    });
    const inserted = documents.map((doc) => index.insert(doc));
    await Promise.all(inserted);
    return index;
  } else {
    console.log("No documents to add");
    return VectorStoreIndex.init({
      storageContext,
    });
  }
}

async function createIndex(documents: Document[]) {
  console.log("Creating index");
  const storageContext = await storageContextFromDefaults({
    vectorStore: new FilterVectorStore(),
  });

  return VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });
}
