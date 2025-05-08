import React, { useRef, useEffect, useState, useCallback } from "react";
import { Send } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { ChatMessage } from "../../store/types";
import { useAuthStore } from "../../store/authStore";
import { getGroupMessages, sendMessage } from "../../services/message";
import { Group } from "../../services/groups";

interface ChatSectionProps {
  group: Group | null;
}

const ChatSection: React.FC<ChatSectionProps> = ({ group }) => {
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const loadMessages = useCallback(async () => {
    if (!group?.id) return;

    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await getGroupMessages(group.id);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [group?.id]);

  useEffect(() => {
    if (group?.id) {
      loadMessages();

      const interval = setInterval(async () => {
        try {
          const fetchedMessages = await getGroupMessages(group.id);

          if (
            JSON.stringify(messagesRef.current) !==
            JSON.stringify(fetchedMessages)
          ) {
            setMessages(fetchedMessages);
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [group?.id, loadMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (newMessageText.trim() === "") return;
    if (!group?.id || !currentUser?.id) return;

    const tempId = Date.now();

    const newMessage: ChatMessage = {
      id: tempId,
      user: currentUser,
      message: newMessageText,
      message_type: "text",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setNewMessageText("");

    try {
      const response = await sendMessage({
        is_group_chat: true,
        message: newMessageText,
        group_id: group.id,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: response.id,
                created_at: response.created_at,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
              }
            : msg
        )
      );
    }
  };

  return (
    <div
      className="flex flex-col h-full max-h-[650px] rounded-lg shadow-sm border min-h-1/2
                   bg-card text-card-foreground border-border
                   dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark flex-grow"
    >
      <div
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingMessages ? (
          <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark">
            No messages yet
          </div>
        ) : (
          messages.map((message: ChatMessage) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.user.id === currentUser?.id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar
                fallback={message.user.first_name?.charAt(0) || "U"}
                src={
                  message.user.profile_picture ||
                  `https://placehold.co/100x100?text=${message.user.first_name?.charAt(
                    0
                  )}`
                }
                alt={message.user.first_name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div
                className={`flex flex-col ${
                  message.user.id === currentUser?.id
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg p-3 ${
                    message.user.id === currentUser?.id
                      ? "bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
                      : "bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                </div>
                <span
                  className={`text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1 ${
                    message.user.id === currentUser?.id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {message.user.first_name || message.user.username} •{" "}
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        className="border-t p-4 flex items-center gap-3
                     border-border bg-background dark:border-border-dark dark:bg-background-dark"
      >
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 text-sm
                     border border-input bg-background text-foreground focus:ring-ring focus:border-ring
                     dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <Button
          className="rounded-full p-2"
          onClick={handleSendMessage}
          disabled={newMessageText.trim() === ""}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
