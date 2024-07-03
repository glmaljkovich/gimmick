import { useRef, KeyboardEventHandler } from "react";
import { LuPlusCircle, LuSendHorizonal } from "react-icons/lu";

type TextAreaProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit?: () => void;
};

export const AutoResizingTextarea = ({
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
        className="min-h-fit bg-black/10 backdrop-blur-lg grow text-slate-300 overflow-y-auto border-white/20 max-h-fit py-2 px-8 rounded-xl border border-gray-800"
        rows={1}
      />
      <button
        ref={submitRef}
        type="submit"
        className="absolute top-5 left-4 text-neutral-400 text-lg"
      >
        <LuPlusCircle />
      </button>
      <button
        ref={submitRef}
        type="submit"
        className="absolute top-5 right-4 text-neutral-400 text-lg"
      >
        <LuSendHorizonal />
      </button>
    </form>
  );
};
