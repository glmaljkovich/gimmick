import { ActiveModel, Model } from ".prisma/client";
import { useEffect, useState } from "react";

export type ModelContextType = {
  model: Model | undefined;
  setModel: (model: Model) => void;
  models: Model[];
  setModels: (models: Model[]) => void;
};

export const useModelContext = () => {
  const [model, setModel] = useState<Model>();
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    const listener1 = window.ipc.on("active-model", (active: any) => {
      console.log("model received", active);
      setModel(active.model);
    });
    window.ipc.send("model.get-active-model", true);
    const listener2 = window.ipc.on("models", (models: Model[]) => {
      setModels(models);
    });
    window.ipc.send("model.get-models", null);
    return () => {
      listener1();
      listener2();
    };
  }, []);

  const context: ModelContextType = {
    model,
    setModel,
    models,
    setModels,
  };
  return context;
};
