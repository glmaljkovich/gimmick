import { useEffect, useState } from "react";

// takes an api key from an input component and send it to the store via ipc
const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState("");
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };
  const handleApiKeySubmit = () => {
    console.log("submitting api key", apiKey);
    window.ipc.send("set-api-key", apiKey);
  };
  useEffect(() => {
    window.ipc.on("api-key", (arg: string) => {
      console.log("api key received", arg);
      setApiKey(arg);
    });
    window.ipc.send("get-api-key", null);
  });
  return (
    <div className="flex flex-col p-2">
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
        Submit
      </button>
    </div>
  );
};
export default function Settings() {
  return (
    <div className="flex flex-col shrink h-full relative p-2">
      <h1>Settings</h1>
      <ApiKeyInput />
    </div>
  );
}
