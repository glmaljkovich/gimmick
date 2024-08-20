import { JSONValue } from "ai";
import { motion } from "framer-motion";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import { SearchResults, SearchResult } from "./SearchResults";

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

const AIMessage = memo(
  ({
    content,
    data,
    index,
  }: {
    content: string;
    data?: JSONValue[];
    index: number;
  }) => {
    const results =
      data && data.length > 0
        ? (JSON.parse(data.at(-1)!["snippets"]) as SearchResult[])
        : [];
    return (
      <motion.div className="flex text-xl text-slate-300 pt-8 w-full">
        <div className="flex flex-col items-center shrink-0">
          <Image
            className="rounded-full mr-2"
            src="/images/clippy.webp"
            alt="Logo image"
            width={36}
            height={36}
          />
        </div>
        <div className="ai-message shrink text-base leading-normal mb-8 px-2">
          {results.length > 0 && <SearchResults results={results} />}
          <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
            {content}
          </ReactMarkdown>
        </div>
      </motion.div>
    );
  },
);

export const ChatMessage = memo(
  ({
    role,
    content,
    data,
    index,
  }: {
    role: string;
    content: string;
    data?: JSONValue;
    index: number;
  }) => {
    return (
      <div className="whitespace-pre-wrap">
        {role === "user" && <UserMessage content={content} />}
        {role === "assistant" && (
          <AIMessage
            content={content}
            data={data as JSONValue[]}
            index={index}
          />
        )}
      </div>
    );
  },
);
