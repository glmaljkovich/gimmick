import { useState } from "react";

export type ChatContextType = {
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
  mode: string;
  modes: string[];
  setMode: (mode: string) => void;
  generatingAnswer: boolean;
  setGeneratingAnswer: (generatingAnswer: boolean) => void;
};

export const useChatContext = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [mode, setMode] = useState("generate");
  const modes = ["generate", "search", "news", "academic"];
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const context: ChatContextType = {
    chatId,
    setChatId,
    mode,
    modes,
    setMode,
    generatingAnswer,
    setGeneratingAnswer,
  };
  return context;
};
