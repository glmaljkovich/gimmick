"use client";
import { Message, useChat } from "ai/react";
import { memo, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { IChat, IMessage } from "../../../main/store";
import { ChatContext } from "@/pages/_chatProvider";
import { AutoResizingTextarea } from "./AutoResizingTextArea";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./chat.css";
import { formatDistanceToNow } from "date-fns";
import { FaClock } from "react-icons/fa";

const ChatMessage = memo(
  ({ role, content }: { role: string; content: string }) => {
    const UserMessage = memo(({ content }: { content: string }) => {
      return (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl pt-6 border-t border-t-white/20"
        >
          {content}
        </motion.h1>
      );
    });

    const AIMessage = memo(({ content }: { content: string }) => {
      return (
        <motion.div className="flex text-xl text-slate-300 pt-8 w-full">
          <div className="flex flex-col items-center shrink-0">
            <Image
              className="rounded-full mr-2"
              src="/images/gimmick.webp"
              alt="Logo image"
              width={36}
              height={36}
            />
          </div>
          <div className="ai-message shrink text-base leading-normal mb-8 px-2">
            <ReactMarkdown
              rehypePlugins={[[rehypeHighlight, { detect: true }]]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </motion.div>
      );
    });

    return (
      <div className="whitespace-pre-wrap">
        {role === "user" && <UserMessage content={content} />}
        {role === "assistant" && <AIMessage content={content} />}
      </div>
    );
  },
);

const TopBar = ({ chatId }: { chatId: string | null }) => {
  const [chat, setChat] = useState<IChat | null>(null);
  useEffect(() => {
    if (chatId) {
      window.ipc.on("chat", (_chat: IChat) => {
        setChat(_chat);
      });
      window.ipc.send("get-chat", chatId);
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
  const { chatId, setChatId } = useContext(ChatContext);
  const prevIdRef = useRef<string | null>(null);
  const msgRef = useRef<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      onFinish: (msg) => {
        if (chatId === null) {
          const uuid = uuidv4() as string;
          setChatId(uuid);
          window.ipc.send("add-chat", {
            id: uuid,
            messages: msgRef.current,
            title: msgRef.current[0].content,
            createdAt: new Date().toISOString(),
          });
          window.ipc.send("get-chats", null);
        } else {
          console.log("update-chat", messages[0].content, messages, chatId);
          window.ipc.send("update-chat", {
            id: chatId,
            messages,
          });
          window.ipc.send("get-chats", null);
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
    // only on chat load
    if (
      chatId !== null &&
      (chatId === prevIdRef.current || !prevIdRef.current)
    ) {
      window.ipc.on("chat-history", (_messages: IMessage[]) => {
        console.log("chat-history", _messages);
        setMessages(_messages as Message[]);
      });
      window.ipc.send("get-chat-history", {
        id: chatId,
      });
    } else {
      setMessages([]);
      prevIdRef.current = chatId;
    }
  }, [chatId, prevIdRef.current]);

  return (
    <div className="relative bg-gradient-to-t to-50% from-purple-500/10 h-full flex flex-col text-white w-full overflow-hidden">
      <div className="overflow-y-auto h-full">
        <TopBar chatId={chatId} />
        {chatId === null ? <WelcomeScreen /> : null}
        <div className="px-4 mb-16">
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} />
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      <AutoResizingTextarea
        value={input}
        onChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
