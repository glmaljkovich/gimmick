"use client";
import { Message, useChat } from "ai/react";
import { memo, useContext, useEffect, useRef } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { IMessage } from "../../../main/store";
import { ChatContext } from "@/pages/_chatProvider";
import { AutoResizingTextarea } from "./AutoResizingTextArea";

const ChatMessage = memo(
  ({ role, content }: { role: string; content: string }) => {
    const UserMessage = memo(({ content }: { content: string }) => {
      return (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl mt-8"
        >
          {content}
        </motion.h1>
      );
    });

    const AIMessage = memo(({ content }: { content: string }) => {
      return (
        <motion.div className="text-xl">
          <div className="flex items-center">
            <Image
              className="rounded-full m-2"
              src="/images/gimmick.webp"
              alt="Logo image"
              width={36}
              height={36}
            />
            <h2 className="text-bold">Answer</h2>
          </div>
          <div className="text-base leading-normal text-slate-300 ml-16">
            {content}
          </div>
        </motion.div>
      );
    });

    return (
      <div className="whitespace-pre-wrap mt-4">
        {role === "user" && <UserMessage content={content} />}
        {role === "assistant" && <AIMessage content={content} />}
      </div>
    );
  },
);

export function Chat() {
  const { chatId, setChatId } = useContext(ChatContext);
  const prevIdRef = useRef<string | null>(null);
  const msgRef = useRef<Message[]>([]);
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
        }
      },
    });

  useEffect(() => {
    if (chatId !== null && messages.length > 0) {
      console.log("update-chat", messages[0].content, messages, chatId);
      window.ipc.send("update-chat", {
        id: chatId,
        title: messages[0].content,
        messages,
      });
      window.ipc.send("get-chats", null);
    }
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
      <div className="overflow-y-auto">
        <span className="p-2 text-xs">{chatId}</span>
        <div className="px-4 mb-14">
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} />
          ))}
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
