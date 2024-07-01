"use client";
import { useChat } from "ai/react";
import { KeyboardEventHandler, useRef, useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import Image from "next/image";

type TextAreaProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit?: () => void;
};

const AutoResizingTextarea = ({
  value,
  onChange,
  handleSubmit,
}: TextAreaProps) => {
  const submitRef = useRef<HTMLButtonElement>(null);
  const handleChange = (event) => {
    autoResizeTextarea(event.target);
    onChange(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitRef.current?.click();
    }
  };

  const autoResizeTextarea = (textarea) => {
    textarea.style.height = "auto"; // Reset the height to auto
    textarea.style.height = textarea.scrollHeight + "px"; // Set the height to the scrollHeight
  };

  return (
    <form onSubmit={handleSubmit} className="bottom-0 absolute w-full p-2 flex">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Say something..."
        className="min-h-fit bg-black/50 backdrop-blur-lg grow text-slate-300 overflow-y-auto bg-slate-800 max-h-fit p-2 rounded-xl mb-2 border border-gray-800"
        rows={1}
      />
      <button
        ref={submitRef}
        type="submit"
        className="absolute top-5 right-4 text-neutral-400"
      >
        <LuSendHorizonal />
      </button>
    </form>
  );
};

function ChatMessage({ role, content }) {
  const UserMessage = ({ content }) => {
    return <h1 className="text-3xl mt-8">{content}</h1>;
  };

  const AIMessage = ({ content }) => {
    return (
      <div className="text-xl">
        <div className="flex items-center">
          <Image
            className="rounded-full m-2"
            src="/images/gimmick.webp"
            alt="Logo image"
            width={48}
            height={48}
          />
          <h2 className="text-bold">Answer</h2>
        </div>
        <div className="text-base text-slate-300 ml-16">{content}</div>
      </div>
    );
  };

  return (
    <div className="whitespace-pre-wrap mt-4">
      {role === "user" && <UserMessage content={content} />}
      {role === "assistant" && <AIMessage content={content} />}
    </div>
  );
}

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="relative flex flex-col text-white w-full">
      <div className="px-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role} content={m.content} />
        ))}
      </div>
      <AutoResizingTextarea
        value={input}
        onChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
