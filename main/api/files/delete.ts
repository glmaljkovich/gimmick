import { Request, Response } from "express";
import { file } from "../../db";
import path from "path";
import { app } from "electron";
import {
  SimpleVectorStore,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

type File = {
  id: string;
  path: string;
};

type APIRequest = {
  files?: File[];
};

export const deleteFiles = (apiKey: string) =>
  async function (req: Request, res: Response) {
    process.env.OPENAI_API_KEY = apiKey;
    console.log("body", req.body);
    const { files }: APIRequest = req.body;
    const index = await loadPersistentIndex();
    const promises = files.map(async (f) => {
      await index.deleteRefDoc(f.id, true);
      await file.deleteFile(f.id);
    });
    await Promise.all(promises);
    // return documents in body
    res.json({ message: "Files deleted" });
  };

async function loadPersistentIndex() {
  console.log("loading index");
  const vectorDbPath = path.join(app.getPath("userData"), "vectorstore");
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
