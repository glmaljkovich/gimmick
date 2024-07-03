import { createContext, useState } from "react";

export const ChatContext = createContext<{
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
}>({
  chatId: null,
  setChatId: () => {},
});

export function ChatProvider({ children }) {
  const [chatId, setChatId] = useState<string | null>(null);
  return (
    <ChatContext.Provider value={{ chatId, setChatId }}>
      {children}
    </ChatContext.Provider>
  );
}
