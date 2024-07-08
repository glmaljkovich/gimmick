import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { VscLibrary } from "react-icons/vsc";
import { FaHistory } from "react-icons/fa";
import { LuFiles } from "react-icons/lu";
import { IoCog } from "react-icons/io5";
import { useRouter } from "next/router";
import cn from "classnames";
import { IChat } from "../../main/store";
import { AppContext } from "@/components/contextProvider";
import { twMerge } from "tailwind-merge";

export function Sidebar() {
  const { chat } = useContext(AppContext);
  const { setChatId } = chat!;
  const [selectedTab, setSelectedTab] = useState("ask");
  const router = useRouter();

  const SidebarAction = ({ action, text, icon, selectedTab }) => {
    return (
      <div onClick={action}>
        <span
          className={twMerge(
            cn(
              "flex flex-col items-center gap-1",
              "text-white/50 text-sm font-light hover:text-white cursor-pointer",
              { "text-white font-medium": selectedTab === text.toLowerCase() },
            ),
          )}
        >
          <span className="text-xl">{icon}</span>
          {text}
        </span>
      </div>
    );
  };

  const newChat = () => {
    setChatId(null);
    setSelectedTab("ask");
    router.push("/ask");
  };

  const openTab = (tab: string) => {
    setSelectedTab(tab);
    router.push(`/${tab}`);
  };

  return (
    <div className="relative flex flex-col w-1/12 min-w-20 h-screen text-white">
      <div className="z-10 flex flex-col grow py-4 px-2 font-light">
        <div className="flex flex-col text-center text-teal-300 font-bold tracking-wide mt-2 text-sm">
          <span className="text-xl">✨</span> gimmick
        </div>
        <div className="flex grow justify-center flex-col gap-4">
          <SidebarAction
            action={newChat}
            text="Ask"
            selectedTab={selectedTab}
            icon={<FaSearch />}
          />
          <SidebarAction
            selectedTab={selectedTab}
            action={() => openTab("history")}
            text="History"
            icon={<FaHistory />}
          />
          <SidebarAction
            selectedTab={selectedTab}
            action={() => openTab("topics")}
            text="Topics"
            icon={<VscLibrary />}
          />
          <SidebarAction
            selectedTab={selectedTab}
            action={() => openTab("files")}
            text="Files"
            icon={<LuFiles />}
          />
        </div>
        <div className="mt-12">
          <SidebarAction
            selectedTab={selectedTab}
            action={() => openTab("settings")}
            text="Settings"
            icon={<IoCog />}
          />
        </div>
      </div>
      <div className="flex"></div>
    </div>
  );
}
