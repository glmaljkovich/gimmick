import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { FaCaretDown, FaClock } from "react-icons/fa";
import { IChat } from "../../../main/store";
import { colorsToHex } from "@/pages/topics";

export const TopBar = ({ chatId }: { chatId: string | null }) => {
  const [chat, setChat] = useState<IChat | null>(null);
  const [topic, setTopic] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  useEffect(() => {
    const listener = window.ipc.on("chat", (_chat: IChat) => {
      console.log("chat", _chat);
      setChat(_chat);
    });
    return listener;
  }, []);
  useEffect(() => {
    if (chatId) {
      window.ipc.send("chat.get-chat", chatId);
      getChatTopic();
      getTopics();
    }
  }, [chatId]);

  async function getChatTopic() {
    fetch(`http://localhost:3001/api/chats/${chatId}/topics`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTopic(data[0]);
      });
  }

  function convertToRelativeTime(dateStr: string | Date | undefined) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  }

  async function assignTopic(topic: string) {
    fetch(`http://localhost:3001/api/topics/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topicId: topic, chatId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTopic(topics.find((t) => t.id === topic));
      });
  }

  async function getTopics() {
    await fetch("http://localhost:3001/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
      });
  }

  function TopicSelector({
    topics,
    setTopic,
  }: {
    topics: any[];
    setTopic: (topic: string) => void;
  }) {
    const [isOpen, setOpen] = useState(false);
    return (
      <div className="z-20 relative w-full">
        <button
          className="w-full px-2 py-1 rounded-lg border border-white/20"
          onClick={() => setOpen(!isOpen)}
        >
          <span>{"Choose a topic..."}</span>
          <FaCaretDown className="float-right mt-1" />
        </button>
        {isOpen && (
          <div className="flex flex-col gap-2 absolute p-2 top-10 right-0 w-full bg-black/30  rounded-lg border border-white/20">
            <div className="absolute top-0 left-0 backdrop-blur-xl w-full h-full"></div>
            {topics.map((t) => (
              <div
                key={t.id}
                className="z-20 relative px-2 py-1 border text-white/75 text-center cursor-pointer hover:text-white rounded-lg"
                style={{ borderColor: colorsToHex[t.color] }}
                onClick={() => {
                  setTopic(t.id);
                  setOpen(false);
                }}
              >
                {t.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function Topic() {
    return (
      <div className="flex gap-2">
        {topic && (
          <div
            className="text-white px-2 py-1 text-sm rounded-lg"
            style={{ backgroundColor: colorsToHex[topic.color] }}
          >
            {topic?.name}
          </div>
        )}
        {!topic && <TopicSelector topics={topics} setTopic={assignTopic} />}
      </div>
    );
  }

  return (
    <div className="z-10 sticky mx-1 top-0 text-sm flex justify-between items-center backdrop-blur-xl p-4 pb-2">
      <div className="flex gap-2">
        {chat?.createdAt && <FaClock className="text-white/50" />}
        <div className="text-white/50">
          {convertToRelativeTime(chat?.createdAt)}
        </div>
      </div>
      <Topic />
    </div>
  );
};
