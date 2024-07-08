import { createContext } from "react";
import {
  ChatContextType,
  useChatContext,
} from "@/components/context/chatContext";
import { ModelContextType, useModelContext } from "./context/modelContext";

export const AppContext = createContext<{
  chat?: ChatContextType;
  model?: ModelContextType;
}>({});

export function ContextProvider({ children }) {
  const chat = useChatContext();
  const model = useModelContext();

  const context = {
    chat,
    model,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
