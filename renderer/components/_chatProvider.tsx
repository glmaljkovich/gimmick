import { createContext, useState } from "react";

export const ChatContext = createContext<{
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
  mode: string;
  modes: string[];
  setMode: (mode: string) => void;
}>({
  chatId: null,
  setChatId: () => {},
  mode: "generate",
  modes: ["generate"],
  setMode: () => {},
});

export function ChatProvider({ children }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [mode, setMode] = useState("generate");
  const modes = ["generate", "search", "news", "academic"];

  const context = {
    chatId,
    setChatId,
    mode,
    modes,
    setMode,
  };

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
}
