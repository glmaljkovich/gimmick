import { Chat } from "@/components/chat/Chat";
import { useContext, useState, useEffect, memo } from "react";
import { IChat } from "../../main/store";
import { AppContext } from "@/components/contextProvider";
import { ChatList } from "@/components/history/ChatList";

export default function History() {
  const { chat } = useContext(AppContext);
  const { chatId, setChatId } = chat!;
  const [chats, setChats] = useState<IChat[]>([]);

  useEffect(() => {
    const listener1 = window.ipc.on("chats", (messages: IChat[]) => {
      // get only the last 10 messages
      setChats(messages.slice(-18));
    });

    const listener2 = window.ipc.on("chat-deleted", (id: string) => {
      window.ipc.send("chat.get-chats", null);
    });

    window.ipc.send("chat.get-chats", null);
    return () => {
      // remove listeners
      listener1();
      listener2();
    };
  }, []);

  return (
    <div className="flex flex-col shrink h-full relative">
      <div className="flex h-full">
        <div className="flex flex-col bg-transparent w-72">
          <ChatList
            chats={chats}
            chatId={chatId}
            setChatId={setChatId}
            showSearch
          />
        </div>
        <Chat />
      </div>
    </div>
  );
}
