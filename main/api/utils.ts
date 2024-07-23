import { Ollama, OllamaEmbedding, OpenAI, OpenAIEmbedding } from "llamaindex";
import { model } from "../db";
import { createOpenAI } from "@ai-sdk/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { createOllama } from "ollama-ai-provider";
import { Model } from ".prisma/client";

type Cache = {
  llm: Model | null;
};

const cache: Cache = {
  llm: null,
};

const llamaIndexProviderToApi = {
  OpenAI: (apiKey: string, model: string) => new OpenAI({ apiKey }),
  Ollama: (apiKey: string, model: string) => new Ollama({ model }),
};

const langchainProviderToApi = {
  OpenAI: (apiKey: string, model: string) => new ChatOpenAI({ apiKey }),
  Ollama: (apiKey: string, model: string) => new ChatOllama({ model }),
};

const vercelToApi = {
  OpenAI: (apiKey: string, model: string) => createOpenAI({ apiKey }),
  Ollama: (apiKey: string, model: string) => createOllama(),
};

const llamaIndexProviderToEmbedding = {
  OpenAI: (apiKey: string, model: string) => new OpenAIEmbedding({ apiKey }),
  Ollama: (apiKey: string, model: string) => new OllamaEmbedding({ model }),
};

export async function getLlamaIndexEmbedding() {
  if (!cache.llm) {
    const llm = await model.getActiveModel(true);
    cache.llm = llm.model;
  }
  return llamaIndexProviderToEmbedding[cache.llm.provider](
    cache.llm.apiKey,
    cache.llm.name,
  );
}

export async function getVercelLLM(apiKey: string) {
  if (!cache.llm) {
    const llm = await model.getActiveModel(true);
    cache.llm = llm.model;
  }
  console.log("cache", cache.llm);
  return vercelToApi[cache.llm.provider](apiKey, cache.llm.name);
}

export async function getLangchainLLM(apiKey: string) {
  if (!cache.llm) {
    const llm = await model.getActiveModel(true);
    cache.llm = llm.model;
  }
  console.log("cache", cache.llm);
  return langchainProviderToApi[cache.llm.provider](apiKey, cache.llm.name);
}

export async function getLlamaIndexLLM(apiKey: string) {
  if (!cache.llm) {
    const llm = await model.getActiveModel(true);
    cache.llm = llm.model;
  }
  console.log("cache", cache.llm);
  return llamaIndexProviderToApi[cache.llm.provider](apiKey, cache.llm.name);
}
