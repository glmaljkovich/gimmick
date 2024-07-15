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
import { AppContext } from "../contextProvider";

type ChatBoxProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit?: FormEventHandler<HTMLFormElement>;
};

const SelectedFiles = ({ files, setFiles }) => {
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
              className="flex max-w-64 bg-teal-500/30 backdrop-blur-lg text-nowrap overflow-x-hidden rounded-xl py-1 px-2"
            >
              <span>{file.split("/").pop()}</span>
              <span
                className="font-bold cursor-pointer ml-2"
                onClick={() => removeFile(file)}
              >
                x
              </span>
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
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    window.ipc.on("file-selected", (files: string[]) => {
      console.log(files);
      setFiles(files);
    });
  }, []);

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
          className="min-h-fit bg-black/10 backdrop-blur-lg grow text-slate-300 overflow-y-auto border-white/20 max-h-fit py-2 px-8 rounded-xl border"
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
      <SelectedFiles files={files} setFiles={setFiles} />
    </form>
  );
};
