import { ChatContext } from "@/components/_chatProvider";
import { useContext, useState } from "react";
import { FaRegNewspaper } from "react-icons/fa6";
import { MdLanguage } from "react-icons/md";
import { FaBuildingColumns } from "react-icons/fa6";
import { FaMagic } from "react-icons/fa";

export const ModeSelector = () => {
  const { mode, setMode, modes } = useContext(ChatContext);
  const [isOpen, setIsOpen] = useState(false);
  const handleModeChange = (mode) => {
    setMode(mode);
    setIsOpen(false);
  };

  const ModeDisplay = ({ icon, mode }) => {
    return (
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <span>{mode}</span>
      </div>
    );
  };

  const modesToDisplay = {
    generate: <ModeDisplay icon={<FaMagic />} mode="generate" />,
    academic: <ModeDisplay icon={<FaBuildingColumns />} mode="academic" />,
    search: <ModeDisplay icon={<MdLanguage />} mode="search" />,
    news: <ModeDisplay icon={<FaRegNewspaper />} mode="news" />,
  };

  return (
    <div className="relative z-10">
      <button
        className="text-neutral-400 backdrop-blur-xl text-sm border-white/20 border px-2 my-1 rounded-xl"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {modesToDisplay[mode]}
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 bg-black/30 backdrop-blur-xl border-white/20 border rounded-lg p-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className="w-full text-left text-neutral-400 hover:text-neutral-300"
            >
              {modesToDisplay[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
