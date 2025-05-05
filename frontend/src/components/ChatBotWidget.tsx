"use client";

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
        <div
          className="w-80 rounded-2xl shadow-2xl border min-h-80 max-h-120 flex flex-col overflow-hidden
                       bg-background border-border dark:bg-background-dark dark:border-border-dark"
        >
          <div
            className="flex justify-between items-center p-4 rounded-t-2xl
                          bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
          >
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> TimeBank Assistant
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="hover:opacity-80 focus:outline-none transition-opacity"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 p-3 space-y-2 overflow-y-auto text-sm
                       bg-muted/30 text-foreground dark:bg-muted-dark/30 dark:text-foreground-dark"
          >
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground dark:text-muted-foreground-dark mt-10">
                Ask me anything!
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-xs px-3 py-2 rounded-xl whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark self-end ml-auto"
                    : "bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark self-start mr-auto"
                }`}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div
                className="max-w-xs px-3 py-2 rounded-xl animate-pulse self-start mr-auto
                          bg-secondary text-muted-foreground dark:bg-secondary-dark dark:text-muted-foreground-dark"
              >
                Typing...
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 p-3 border-t
                          border-border bg-background dark:border-border-dark dark:bg-background-dark"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" disabled={isLoading}>
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 shadow-lg"
          variant="default"
        >
          <MessageCircle className="w-4 h-4" />
          Ask Assistant
        </Button>
      )}
    </div>
  );
}
