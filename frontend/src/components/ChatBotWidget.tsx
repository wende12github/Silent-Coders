import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { SendHorizonal, MessageCircle, X } from "lucide-react";
import Button from "./ui/Button";
import { Input } from "./ui/Form";

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border min-h-80 max-h-120 border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-t-2xl">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> TimeBank Assistant
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="hover:text-gray-200 focus:outline-none"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 p-3 space-y-2 overflow-y-auto text-sm bg-gray-50"
          >
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 mt-10">
                Ask me anything!
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-xs px-3 py-2 rounded-xl whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-100 text-blue-800 self-end ml-auto"
                    : "bg-gray-200 text-gray-800 self-start mr-auto"
                }`}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div className="max-w-xs px-3 py-2 rounded-xl bg-gray-200 text-gray-500 animate-pulse self-start mr-auto">
                Typing...
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              size="icon"
            >
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Ask Assistant
        </Button>
      )}
    </div>
  );
}
