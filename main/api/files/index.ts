import { app } from "electron";
import { Request, Response } from "express";
import {
  storageContextFromDefaults,
  VectorStoreIndex,
  Document,
} from "llamaindex";
import path from "path";
import { FilterVectorStore } from "../chat/FilterVectorStore";

async function loadFiles() {
  const vectorDbPath = path.join(app.getPath("userData"), "vectorstore");
  const storageContext = await storageContextFromDefaults({
    persistDir: vectorDbPath,
    vectorStore: new FilterVectorStore(),
  });
  const docs = await storageContext.docStore.docs();
  return docs;
}

export const files = (apiKey: string) =>
  async function (req: Request, res: Response) {
    const documents = await loadFiles();
    // return documents in body
    res.json(documents);
  };
