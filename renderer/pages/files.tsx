import { useContext, useEffect, useState } from "react";
import { File } from ".prisma/client";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { AppContext } from "@/components/contextProvider";
import { useRouter } from "next/router";

export const FilesSkeleton = () => {
  return (
    <div className="grid grid-cols-4 min-h-24 w-full gap-4 mb-4 justify-center items-center">
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

const FileResult = ({
  file,
  deleteFile,
}: {
  file: File;
  deleteFile: (e, f: File) => void;
}) => {
  const { chat } = useContext(AppContext);
  const { setFiles, setChatId } = chat!;
  const router = useRouter();
  const resultVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const linkName = (result: File) => {
    return result.name;
  };

  const formatLink = (result: File) => {
    return `file://${result.path}`;
  };

  const setFile = () => {
    setChatId(null);
    setFiles([file.path]);
    router.push("/ask");
  };

  return (
    <motion.div
      key={file.path}
      variants={resultVariants}
      onClick={setFile}
      className="relative cursor-pointer min-h-20 flex flex-col justify-between p-2 h-full rounded-xl bg-gradient-to-tr from-blue-500/20 to-pink-500/20 hover:from-blue-500/30 hover:to-pink-500/30"
    >
      <p className="text-xs font-bold mr-2 break-words" title={file.id}>
        {file.name}
        <span
          className="font-bold ml-2 float-right"
          onClick={(e) => deleteFile(e, file)}
        >
          x
        </span>
      </p>
      <p
        style={{ fontSize: "9px" }}
        className="max-h-6 my-1 overflow-hidden whitespace-normal text-ellipsis"
      >
        {file.snippet}
      </p>
      <a
        href={formatLink(file)}
        target="_blank"
        rel="noreferrer"
        className="text-teal-500 text-xs overflow-x-hidden"
        title={file.path}
      >
        {linkName(file)}
      </a>
    </motion.div>
  );
};

function Searchbox() {
  return (
    <div className="flex flex-col w-80 relative float-right text-sm">
      <input
        type="text"
        placeholder="Search for files"
        className="bg-black/20 backdrop-blur-lg w-full px-2 py-1 rounded-lg border border-white/20"
      />
      <FaSearch className="absolute right-2 top-2 text-gray-500" />
    </div>
  );
}

export default function Files() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  function deleteFile(e, file: File) {
    e.stopPropagation();
    fetch("http://localhost:3001/api/files/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: [{ id: file.id, path: file.path }] }),
    })
      .then((response) => response.json())
      .then((data) => {
        getFiles();
      });
  }

  function getFiles() {
    fetch("http://localhost:3001/api/files", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setFiles(data);
      });
  }

  useEffect(() => {
    getFiles();
  }, []);

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="flex flex-col shrink h-full relative">
      <h1 className="flex justify-between text-3xl p-4">
        Files
        <Searchbox />
      </h1>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4"
      >
        {loading && <FilesSkeleton />}
        {files.map((file) => (
          <FileResult file={file} deleteFile={deleteFile} />
        ))}
      </motion.div>
    </div>
  );
}
