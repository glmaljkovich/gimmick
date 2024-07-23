import { app } from "electron";
import { Request, Response } from "express";
import {
  PDFReader,
  TextFileReader,
  DocxReader,
  storageContextFromDefaults,
  VectorStoreIndex,
  SimpleVectorStore,
  Document,
  Settings,
  OpenAI,
} from "llamaindex";
import path from "path";
import { file } from "../../db";
import { getLlamaIndexEmbedding, getLlamaIndexLLM } from "../utils";
import fs from "fs";

type APIRequest = {
  files?: string[];
};

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

async function updatePersistentIndex(documents: Document[]) {
  console.log("updating index");
  const vectorDbPath = path.join(app.getPath("userData"), "vectorstore");
  console.log("vectorDbPath", vectorDbPath);
  const embedding = await getLlamaIndexEmbedding();
  const store = await SimpleVectorStore.fromPersistDir(vectorDbPath, embedding);
  const storageContext = await storageContextFromDefaults({
    persistDir: vectorDbPath,
    vectorStore: store,
  });

  if (documents.length > 0) {
    console.log("Adding documents to index");
    const indexPath = path.join(vectorDbPath, "index_store.json");
    let index: VectorStoreIndex;
    // check if path exists
    if (fs.existsSync(indexPath)) {
      index = await VectorStoreIndex.init({
        storageContext,
      });
      const inserted = documents.map((doc) => index.insert(doc));
      await Promise.all(inserted);
    } else {
      index = await VectorStoreIndex.fromDocuments(documents, {
        storageContext,
      });
    }
    return index;
  } else {
    console.error("No documents to add");
  }
}

export const uploadFiles = (apiKey: string) =>
  async function (req: Request, res: Response) {
    Settings.llm = await getLlamaIndexLLM(apiKey);
    const { files }: APIRequest = req.body;
    let documents: Document[] = [];
    if (files) {
      const filesdata = await Promise.all(
        files.map(async (file) => loadDocument(file)),
      );
      documents = filesdata.flat();
    }
    await updatePersistentIndex(documents);
    const fileService = file;
    const filePromises = documents?.map((doc) => {
      const file = {
        name: doc.metadata["file_name"],
        path: doc.metadata["file_path"],
        snippet: doc.getText().slice(0, 150),
        id: doc.id_,
      };
      return fileService.addFile(file);
    });
    const uploadedFiles = await Promise.all(filePromises);
    res.json({ files: uploadedFiles.map((file) => file.id) });
  };
