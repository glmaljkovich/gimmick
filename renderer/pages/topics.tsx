import { Chat } from "@/components/chat/Chat";
import { useContext, useState, useEffect, memo } from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";
import { IChat } from "../../main/store";
import { AppContext } from "@/components/contextProvider";
import { FaSearch } from "react-icons/fa";
import { ChatList } from "@/components/history/ChatList";
import { FaCaretDown } from "react-icons/fa6";

export const colorsToHex = {
  red: "#dc2626",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#fbbf24",
};

export default function Topics() {
  const { chat } = useContext(AppContext);
  const { chatId, setChatId } = chat!;
  const [chats, setChats] = useState<IChat[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [topicId, setTopicId] = useState<string | null>(null);

  async function getTopics() {
    await fetch("http://localhost:3001/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
      });
  }

  async function getTopicChats(topicId: string) {
    await fetch(`http://localhost:3001/api/topics/${topicId}/chats`)
      .then((res) => res.json())
      .then((data) => {
        setChats(data);
      });
  }

  useEffect(() => {
    getTopics();
  }, []);

  useEffect(() => {
    if (topicId) {
      getTopicChats(topicId);
    }
  }, [topicId]);

  const loadTopic = (topicId: string) => {
    setTopicId(topicId);
  };

  const deleteTopic = (topicId: string) => {
    fetch(`http://localhost:3001/api/topics/${topicId}`, {
      method: "DELETE",
    }).then(() => {
      getTopics();
      setTopicId(null);
    });
  };

  const TopicEntry = memo(
    ({
      topic,
      currentTopicId,
    }: {
      topic: any;
      currentTopicId: string | null;
    }) => {
      return (
        <div
          key={topic.id}
          id={topic.id}
          style={{ borderColor: colorsToHex[topic.color] }}
          className={twMerge(
            cn(
              "grid grid-cols-10 border pl-2 px-2 py-1 mb-2 w-52 text-white/75 leading-snug tracking-wide text-sm hover:text-white cursor-pointer rounded-lg",
              {
                "text-white text-bold":
                  topic.id.toString() === currentTopicId?.toString(),
              },
            ),
          )}
        >
          <span
            className="col-span-9 text-nowrap text-ellipsis overflow-x-hidden"
            onClick={() => loadTopic(topic.id)}
          >
            {topic.name}
          </span>
          <button
            className="col-span-1 float-right text-white/50 hover:text-white"
            onClick={() => deleteTopic(topic.id)}
          >
            x
          </button>
        </div>
      );
    },
  );

  function Searchbox() {
    return (
      <div className="flex flex-col w-full relative float-right text-sm mb-4">
        <input
          type="text"
          placeholder="Search your topics..."
          className="bg-black/20 backdrop-blur-lg w-full px-2 py-1 rounded-lg border border-white/20"
        />
        <FaSearch className="absolute right-2 top-2 text-gray-500" />
      </div>
    );
  }

  function ColorDropdown({
    color,
    setColor,
  }: {
    color: string;
    setColor: (color: string) => void;
  }) {
    const [isOpen, setOpen] = useState(false);
    const colors = ["red", "blue", "green", "yellow"];
    return (
      <div className="relative w-full">
        <button
          className="w-full px-2 py-1 rounded-lg border border-white/20"
          style={{ backgroundColor: colorsToHex[color] }}
          onClick={() => setOpen(!isOpen)}
        >
          <span>{color}</span>
          <FaCaretDown className="float-right" />
        </button>
        {isOpen && (
          <div className="flex flex-col gap-2 absolute p-1 top-10 right-0 w-full bg-black/20 backdrop-blur-lg rounded-lg border border-white/20">
            {colors.map((c) => (
              <div
                className="px-2 py-1 text-white text-center cursor-pointer hover:opacity-75 rounded-lg"
                style={{ backgroundColor: colorsToHex[c] }}
                onClick={() => {
                  setColor(c);
                  setOpen(false);
                }}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function AddTopic() {
    const [topic, setTopic] = useState("");
    const [color, setColor] = useState("red");
    const [isOpen, setOpen] = useState(false);
    function addTopic() {
      fetch("http://localhost:3001/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: topic, color }),
      }).then(() => {
        getTopics();
        setTopic("");
      });
    }
    return (
      <div className="w-full text-sm mb-4 rounded-lg border border-white/20 px-2 py-1">
        <div className="text-white/50" onClick={() => setOpen((open) => !open)}>
          Add a new topic <FaCaretDown className="float-right" />
        </div>
        {isOpen && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Topic name"
              name="topic"
              className="bg-black/20 mt-2 backdrop-blur-lg w-full px-2 py-1 rounded-lg border border-white/20"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div>
              <div className="text-white/50">Color</div>
              <ColorDropdown color={color} setColor={setColor} />
            </div>
            <button
              className="bg-teal-400/20 border border-teal-400 text-white rounded-lg px-2 py-1"
              onClick={addTopic}
            >
              Add
            </button>
          </div>
        )}
      </div>
    );
  }

  const TopicList = ({
    topics,
    topicId,
  }: {
    topics: any[];
    topicId: string | null;
  }) => {
    return (
      <div className="flex flex-col overflow-x-hidden min-w-52 h-full bg-gradient-to-l from-purple-500/10 border-r p-2 border-r-white/20">
        <Searchbox />
        <AddTopic />
        {topics.sort().map((c) => (
          <TopicEntry topic={c} currentTopicId={topicId} />
        ))}
        {topics.length === 0 && (
          <div className="text-white/50 text-center mt-4">No topics found</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col shrink h-full relative">
      <div className="flex h-full">
        <div className="flex flex-col bg-transparent">
          <TopicList topics={topics} topicId={topicId} />
        </div>
        <ChatList chats={chats} chatId={chatId} setChatId={setChatId} />
      </div>
    </div>
  );
}
