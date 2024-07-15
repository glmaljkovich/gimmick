import { AppContext } from "@/components/contextProvider";
import { useContext, useState } from "react";

// takes an api key from an input component and send it to the store via ipc
const ModelSelect = () => {
  const { model: modelCtx } = useContext(AppContext);
  const { models, setModels, model, setModel } = modelCtx!;
  const [apiKey, setApiKey] = useState(model?.apiKey || "");

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };
  const handleApiKeySubmit = () => {
    window.ipc.send("model.set-api-key", {
      apiKey: apiKey,
      modelId: model?.id,
    });
    window.ipc.send("model.get-active-model", true);
  };
  return (
    <div className="flex flex-col p-2 max-w-96">
      <h2 className="px-2">Model</h2>
      <select
        value={model?.id}
        onChange={(e) => setModel(models.find((m) => m.id === e.target.value)!)}
        className="p-2 m-2 border border-white/20 bg-black/20 rounded-md"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.provider} - {m.name}
          </option>
        ))}
      </select>
      <h2 className="px-2">API Key</h2>
      <input
        type="text"
        value={apiKey}
        onChange={handleApiKeyChange}
        className="p-2 m-2 border border-white/20 bg-black/20 rounded-md"
        placeholder="Enter your API key"
      />
      <button
        className="p-2 m-2 border border-white/20 hover:bg-white/10 rounded-md"
        onClick={handleApiKeySubmit}
      >
        Save
      </button>
    </div>
  );
};
export default function Settings() {
  return (
    <div className="flex flex-col shrink h-full relative p-2">
      <h1 className="text-2xl p-3">Settings</h1>
      <ModelSelect />
    </div>
  );
}
