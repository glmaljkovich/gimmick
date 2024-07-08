"use client";
import { Message, useChat, useCompletion } from "ai/react";
import {
  FormEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { IChat, IMessage } from "../../../main/store";
import { AppContext } from "@/components/contextProvider";
import { ChatBox } from "./Chatbox";
import "highlight.js/styles/github-dark.css";
import "./chat.css";
import { formatDistanceToNow } from "date-fns";
import { FaClock } from "react-icons/fa";
import { ChatMessage, SearchResultsSkeleton } from "./ChatMessage";
import { JSONValue } from "ai";

const TopBar = ({ chatId }: { chatId: string | null }) => {
  const [chat, setChat] = useState<IChat | null>(null);
  useEffect(() => {
    if (chatId) {
      window.ipc.on("chat", (_chat: IChat) => {
        setChat(_chat);
      });
      window.ipc.send("chat.get-chat", chatId);
    }
  }, [chatId]);

  function convertToRelativeTime(dateStr: string | undefined) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return (
    <div className="text-sm flex items-center p-4 pb-2 gap-2">
      {chat?.createdAt && <FaClock className="text-white/50" />}
      <div className="text-white/50">
        {convertToRelativeTime(chat?.createdAt)}
      </div>
    </div>
  );
};

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-1/2">
      <div className="text-4xl font-thin text-white text-center">
        The world at your fingertips.
      </div>
    </div>
  );
}

export function Chat() {
  const { chat, model } = useContext(AppContext);
  const { chatId, setChatId, generatingAnswer, setGeneratingAnswer, mode } =
    chat!;
  const prevIdRef = useRef<string | null>(null);
  const msgRef = useRef<Message[]>([]);
  const dataRef = useRef<JSONValue>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    data,
    isLoading,
  } = useChat({
    api: "http://localhost:3001/api/generate",
    sendExtraMessageFields: true,
    onFinish: (msg) => {
      setGeneratingAnswer(false);
      if (chatId === null) {
        const uuid = uuidv4() as string;
        setChatId(uuid);
        window.ipc.send("chat.add-chat", {
          id: uuid,
          messages: msgRef.current?.map((m) => ({
            ...m,
            data: dataRef.current,
          })),
          title: msgRef.current[0].content,
          createdAt: new Date().toISOString(),
        });
        window.ipc.send("chat.get-chats", null);
      } else {
        console.log("chat.update-chat", messages[0].content, messages, chatId);
        window.ipc.send("chat.update-chat", {
          id: chatId,
          messages: msgRef.current?.map((m) => ({
            ...m,
            data: dataRef.current,
          })),
          data: dataRef.current,
        });
        window.ipc.send("chat.get-chats", null);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    msgRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (data) {
      dataRef.current = data;
    }
  }, [data]);

  useEffect(() => {
    // only on chat load
    if (
      chatId !== null &&
      (chatId === prevIdRef.current || !prevIdRef.current)
    ) {
      window.ipc.on("chat-history", (_messages: IMessage[]) => {
        console.log("chat.chat-history", _messages);
        setMessages(_messages as Message[]);
      });
      window.ipc.send("chat.get-chat-history", {
        id: chatId,
      });
    } else {
      setMessages([]);
      prevIdRef.current = chatId;
    }
  }, [chatId, prevIdRef.current]);

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setGeneratingAnswer(true);
      const body = {
        mode,
      };
      handleSubmit(event, { options: { body } });
      scrollToBottom();
    },
    [input],
  );

  return (
    <div className="relative bg-gradient-to-t to-50% from-purple-500/10 h-full flex flex-col text-white w-full overflow-hidden">
      <div className="overflow-y-auto h-full">
        <TopBar chatId={chatId} />
        {chatId === null && !isLoading ? <WelcomeScreen /> : null}
        <div className="px-4 mb-16">
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              content={m.content}
              data={m.data || data}
            />
          ))}
          {isLoading && messages.length < 2 && <SearchResultsSkeleton />}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      <ChatBox
        value={input}
        onChange={handleInputChange}
        handleSubmit={onSubmit}
      />
    </div>
  );
}
