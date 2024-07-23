import { motion } from "framer-motion";

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

export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  type?: string;
};

type SearchResultsProps = {
  results: SearchResult[];
};

export const SearchResults = ({ results }: SearchResultsProps) => {
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

  const linkName = (result: SearchResult) => {
    if (result.type === "file") {
      return result.link.split("/").pop();
    }
    return result.link.split("/")[2];
  };

  const formatLink = (result: SearchResult) => {
    if (result.type === "file") {
      return `file://${result.link}`;
    }
    return result.link;
  };

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 min-h-24 w-full gap-4 mb-4 justify-center items-center"
      initial="hidden"
      whileInView="visible"
      variants={variants}
    >
      <motion.div className="col-span-2 lg:col-span-4 text-xs font-bold">
        Search Results
      </motion.div>
      {results.map((result, index) => (
        <motion.div
          key={result.link}
          variants={resultVariants}
          className="relative min-h-20 flex flex-col justify-between p-2 h-full rounded-xl bg-gradient-to-tr from-blue-500/20 to-pink-500/20 hover:from-blue-500/30 hover:to-pink-500/30"
        >
          <p
            className="text-xs font-bold mr-2 break-words"
            title={result.title}
          >
            {result.title}
            <div className="rounded-full text-center text-teal-500 bg-black/30 w-4 h-4 absolute top-1 right-1">
              {index + 1}
            </div>
          </p>
          {result.type === "file" && (
            <p
              style={{ fontSize: "9px" }}
              className="max-h-6 my-1 overflow-hidden whitespace-normal text-ellipsis"
            >
              {result.snippet}
            </p>
          )}
          <a
            href={formatLink(result)}
            target="_blank"
            rel="noreferrer"
            className="text-teal-500 text-xs overflow-x-hidden"
            title={result.link}
          >
            {linkName(result)}
          </a>
        </motion.div>
      ))}
    </motion.div>
  );
};
