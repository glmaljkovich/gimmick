import { Chat } from "@/components/chat/Chat";
import { useContext, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";
import { IChat } from "../../main/store";
import { AppContext } from "@/components/contextProvider";

export default function History() {
  const { chat } = useContext(AppContext);
  const { chatId, setChatId } = chat!;
  const [chats, setChats] = useState<IChat[]>([]);
  useEffect(() => {
    window.ipc.on("chats", (messages: IChat[]) => {
      // get only the last 10 messages
      setChats(messages.slice(-10));
    });

    window.ipc.send("chat.get-chats", null);
  }, []);

  const loadChat = (chatId: string) => {
    console.log("loadChat", chatId);
    setChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    console.log("deleteChat", chatId);
    window.ipc.send("chat.delete-chat", chatId);
    window.ipc.send("chat.get-chats", null);
  };

  const sortByCreatedAt = (a: IChat, b: IChat) => {
    return a.createdAt > b.createdAt ? -1 : 1;
  };

  const ChatList = ({
    chats,
    chatId,
  }: {
    chats: IChat[];
    chatId: string | null;
  }) => {
    return chats.sort(sortByCreatedAt).map((chat) => {
      return (
        <div
          key={chat.id}
          id={chat.id}
          className={twMerge(
            cn(
              "grid grid-cols-10 pl-2 pb-2 pt-4 w-48 text-white/75 leading-snug tracking-wide text-xs font-bold border-b border-b-white/20 hover:bg-white/15 cursor-pointer",
              {
                "text-white text-bold":
                  chat.id.toString() === chatId?.toString(),
              },
            ),
          )}
        >
          <span
            className="col-span-9 text-nowrap text-ellipsis overflow-x-hidden"
            onClick={() => loadChat(chat.id)}
          >
            {chat.title}
          </span>
          <button
            className="col-span-1 float-right text-white/50 hover:text-white"
            onClick={() => deleteChat(chat.id)}
          >
            x
          </button>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col shrink h-full relative">
      <div className="flex h-full">
        <div className="flex flex-col bg-gradient-to-l from-purple-500/10 border-r p-2 border-r-white/20">
          <ChatList chats={chats} chatId={chatId} />
        </div>
        <Chat />
      </div>
    </div>
  );
}
