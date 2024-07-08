import { useEffect, useState } from "react";

export type ModelContextType = {
  provider: string;
  modelId: string;
  modelName: string;
  apiKey: string;
  setProvider: (provider: string) => void;
  setModelId: (modelId: string) => void;
  setModelName: (modelName: string) => void;
  setApiKey: (apiKey: string) => void;
};

export const useModelContext = () => {
  const [provider, setProvider] = useState<string>("OpenAI");
  const [modelId, setModelId] = useState<string>("gpt-4o");
  const [modelName, setModelName] = useState<string>("gpt-4o");
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    window.ipc.on("api-key", (arg: string) => {
      console.log("api key received", arg);
      setApiKey(arg);
    });
    window.ipc.send("model.get-api-key", null);
  }, []);

  const context: ModelContextType = {
    provider,
    modelId,
    modelName,
    apiKey,
    setProvider,
    setModelId,
    setModelName,
    setApiKey,
  };
  return context;
};
