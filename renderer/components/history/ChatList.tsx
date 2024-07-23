import { FaSearch } from "react-icons/fa";
import { IChat } from "../../../main/store";
import { HistoryEntry } from "./HistoryEntry";
import { useRouter } from "next/router";

export const ChatList = ({
  chats,
  chatId,
  setChatId,
  showSearch,
}: {
  chats: IChat[];
  chatId: string | null;
  setChatId: (chatId: string) => void;
  showSearch?: boolean;
}) => {
  const router = useRouter();
  const loadChat = (chatId: string) => {
    console.log("loadChat", chatId);
    setChatId(chatId);
    router.push("/history");
  };

  const deleteChat = (chatId: string) => {
    console.log("deleteChat", chatId);
    window.ipc.send("chat.delete-chat", chatId);
  };

  const sortByCreatedAt = (a: IChat, b: IChat) => {
    return a.createdAt > b.createdAt ? -1 : 1;
  };

  function Searchbox() {
    return (
      <div className="flex flex-col w-full relative float-right text-sm mb-4">
        <input
          type="text"
          placeholder="Search your chats..."
          className="bg-black/20 backdrop-blur-lg w-full px-2 py-1 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-transparent"
        />
        <FaSearch className="absolute right-2 top-2 text-gray-500" />
      </div>
    );
  }
  return (
    <div className="flex flex-col overflow-x-hidden w-full h-full bg-gradient-to-l from-purple-500/10 border-r p-2 border-r-white/20">
      {showSearch && <Searchbox />}
      {chats.sort(sortByCreatedAt).map((c) => (
        <HistoryEntry
          chat={c}
          currentChatId={chatId}
          loadChat={loadChat}
          deleteChat={deleteChat}
        />
      ))}
      {chats.length === 0 && (
        <div className="text-white/50 text-center mt-4">No chats found</div>
      )}
    </div>
  );
};
