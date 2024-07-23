import { ModeSelector } from "./ModeSelector";
import {
  useRef,
  KeyboardEventHandler,
  FormEventHandler,
  useState,
  useContext,
  useEffect,
} from "react";
import { LuPlusCircle, LuSendHorizonal } from "react-icons/lu";
import { ImSpinner10 } from "react-icons/im";
import { AppContext } from "../contextProvider";

type ChatBoxProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit?: FormEventHandler<HTMLFormElement>;
};

const SelectedFiles = ({ files, setFiles, uploading }) => {
  const removeFile = (file) => {
    setFiles(files.filter((f) => f !== file));
  };
  return (
    <>
      {files.length > 0 && (
        <div className="flex py-2 gap-2 text-xs w-full">
          {files.map((file) => (
            <div
              key={file}
              className="flex max-w-64 bg-black/20 border-teal-300/75 text-neutral-400 border backdrop-blur-lg text-nowrap overflow-x-hidden rounded-xl py-1 px-2"
            >
              <span>{file.split("/").pop()}</span>
              {!uploading && (
                <span
                  className="font-bold cursor-pointer ml-2 hover:text-teal-300"
                  onClick={() => removeFile(file)}
                >
                  x
                </span>
              )}
              {uploading && (
                <ImSpinner10 className="ml-2 inline-flex animate-spin" />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export const ChatBox = ({ value, onChange, handleSubmit }: ChatBoxProps) => {
  const { chat: chatCtx } = useContext(AppContext);
  const { files, setFiles } = chatCtx!;
  const [uploading, setUploading] = useState<boolean>(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const listener = window.ipc.on("file-selected", (files: string[]) => {
      if (!uploading) {
        console.log(files);
        setUploading(true);
        setFiles(files);
        uploadFiles(files);
      }
    });
    return listener;
  }, []);

  const uploadFiles = async (files: string[]) => {
    const response = await fetch("http://localhost:3001/api/files/upload", {
      method: "POST",
      body: JSON.stringify({ files }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("fileIds", data);
    setUploading(false);
  };

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

  const selectFiles = (event) => {
    event.preventDefault();
    window.ipc.send("select-files", null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bottom-0 absolute w-full p-2 flex flex-col"
    >
      <ModeSelector />
      <div className="flex relative">
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Say something..."
          className="min-h-fit bg-black/10 backdrop-blur-lg grow text-slate-300 overflow-y-auto border-white/20 max-h-fit py-2 px-8 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-transparent resize-none"
          rows={1}
        />
        <button
          onClick={selectFiles}
          type="button"
          className="absolute top-3 left-2 text-neutral-400 text-lg"
        >
          <LuPlusCircle />
        </button>
        <button
          ref={submitRef}
          type="submit"
          className="absolute top-3 right-3 text-neutral-400 text-lg"
        >
          <LuSendHorizonal />
        </button>
      </div>
      <SelectedFiles files={files} setFiles={setFiles} uploading={uploading} />
    </form>
  );
};
