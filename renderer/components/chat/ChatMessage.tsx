import { JSONValue } from "ai";
import { motion } from "framer-motion";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";

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

export const SearchResultsSkeleton = () => {
  return (
    <div className="grid grid-cols-4 min-h-24 w-full gap-4 mb-4 justify-center items-center">
      <div className="col-span-4 text-xs font-bold">Search Results</div>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex flex-col min-w-24 animate-pulse justify-between p-2 h-full rounded-xl bg-gradient-to-tr from-blue-500/20 to-pink-500/20"
        >
          <div className="w-3/4 h-4 bg-white/20 rounded-full"></div>
          <div className="w-1/2 h-4 bg-white/20 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

type SearchResultsProps = {
  results: SearchResult[];
};

const SearchResults = ({ results }: SearchResultsProps) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.35, staggerChildren: 0.15 },
    },
  };
  const resultVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  return (
    <motion.div
      className="grid grid-cols-4 min-h-24 w-full gap-4 mb-4 justify-center items-center"
      initial="hidden"
      whileInView="visible"
      variants={variants}
    >
      <motion.div className="col-span-4 text-xs font-bold">
        Search Results
      </motion.div>
      {results.map((result) => (
        <motion.div
          key={result.link}
          variants={resultVariants}
          className="flex flex-col justify-between p-2 h-full rounded-xl bg-gradient-to-tr from-blue-500/20 to-pink-500/20 hover:from-blue-500/30 hover:to-pink-500/30"
        >
          <p className="text-xs font-bold" title={result.title}>
            {result.title}
          </p>
          <a
            href={result.link}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 text-xs"
            title={result.link}
          >
            {result.link.split("/")[2]}
          </a>
        </motion.div>
      ))}
    </motion.div>
  );
};

const AIMessage = memo(
  ({ content, data }: { content: string; data?: JSONValue[] }) => {
    const results =
      data && data[0]
        ? (JSON.parse(data[0]["snippets"]) as SearchResult[])
        : [];
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
  }: {
    role: string;
    content: string;
    data?: JSONValue;
  }) => {
    return (
      <div className="whitespace-pre-wrap">
        {role === "user" && <UserMessage content={content} />}
        {role === "assistant" && (
          <AIMessage content={content} data={data as JSONValue[]} />
        )}
      </div>
    );
  },
);
