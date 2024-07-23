import { memo } from "react";
import { twMerge } from "tailwind-merge";
import { IChat } from "../../../main/store";
import cn from "classnames";

export const HistoryEntry = memo(
  ({
    chat,
    currentChatId,
    deleteChat,
    loadChat,
  }: {
    chat: IChat;
    currentChatId: string | null;
    deleteChat: (id: string) => void;
    loadChat: (id: string) => void;
  }) => {
    function chatDelete(event) {
      event.stopPropagation();
      deleteChat(chat.id);
    }
    return (
      <div
        key={chat.id}
        id={chat.id}
        onClick={() => loadChat(chat.id)}
        className={twMerge(
          cn(
            "grid grid-cols-10 pl-2 pb-2 pt-4 w-full text-white/75 leading-snug tracking-wide text-xs font-bold  hover:bg-white/15 cursor-pointer",
            {
              "text-white text-bold":
                chat.id.toString() === currentChatId?.toString(),
            },
          ),
        )}
      >
        <span className="col-span-9 text-nowrap text-ellipsis overflow-x-hidden">
          {chat.title}
        </span>
        <button
          className="col-span-1 float-right text-white/50 hover:text-white"
          onClick={(e) => chatDelete(e)}
        >
          x
        </button>
      </div>
    );
  },
);
