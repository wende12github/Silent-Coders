import React, { useRef, useEffect, useState, useCallback } from "react";
import { Send } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { ChatMessage } from "../../store/types";
import { useAuthStore } from "../../store/authStore";
import { getGroupMessages } from "../../services/message";
import { GroupDetail } from "../../store/types";
import { useWebSocketStore } from "../../store/webSocketStore";
import { toast } from "sonner";

interface ChatSectionProps {
  group: GroupDetail | null;
}

const ChatSection: React.FC<ChatSectionProps> = ({ group }) => {
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const {
    connect,
    disconnect,
    sendMessage: sendWebSocketMessage,
    addHandler,
    removeHandler,
    isConnected,
  } = useWebSocketStore();

  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const loadInitialMessages = useCallback(async () => {
    if (!group?.id) return;

    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await getGroupMessages(group.id);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load initial messages:", error);
      toast.error("Failed to load initial messages.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [group?.id]);

  useEffect(() => {
    if (!group?.id || !currentUser?.id) {
      disconnect();
      setMessages([]);
      return;
    }

    loadInitialMessages();

    connect("group", group.id);

    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat_message") {
          const receivedMessage: ChatMessage = {
            id: data.id,
            user: {
              id: data.user_id,
              username: data.user,
              first_name: data.user_first_name,
              last_name: data.user_last_name,
              profile_picture: data.user_profile_picture,
            },
            message: data.message,
            message_type: data.message_type || "text",
            created_at: data.created_at,
          };

          setMessages((prevMessages) => {
            const existingMessageIndex = prevMessages.findIndex(
              (msg) => msg.id === receivedMessage.id
            );

            if (existingMessageIndex > -1) {
              const updatedMessages = [...prevMessages];
              updatedMessages[existingMessageIndex] = receivedMessage;
              return updatedMessages;
            } else {
              return [...prevMessages, receivedMessage];
            }
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        toast.error("Error receiving message.");
      }
    };

    addHandler(handleWebSocketMessage);

    return () => {
      removeHandler(handleWebSocketMessage);
      disconnect();
    };
  }, [
    group?.id,
    currentUser?.id,
    connect,
    disconnect,
    addHandler,
    removeHandler,
    loadInitialMessages,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const messageText = newMessageText.trim();
    if (messageText === "") return;
    if (!group?.id || !currentUser?.id || !isConnected) {
      console.warn("Cannot send message: not connected or missing info.");
      toast.warning("Cannot send message: not connected.");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const tempMessage: ChatMessage = {
      id: parseInt(tempId),
      user: currentUser,
      message: messageText,
      message_type: "text",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessageText("");

    try {
      sendWebSocketMessage({
        type: "send_message",
        message: messageText,
      });
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error);
      toast.error("Failed to send message.");

      setMessages((prev) => prev.filter((msg) => msg.id !== parseInt(tempId)));
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
                fallback={
                  message.user.first_name?.charAt(0) ||
                  message.user.username?.charAt(0) ||
                  "U"
                }
                src={
                  message.user.profile_picture ||
                  `https://placehold.co/100x100?text=${
                    message.user.first_name?.charAt(0) ||
                    message.user.username?.charAt(0) ||
                    "U"
                  }`
                }
                alt={message.user.first_name || message.user.username || "User"}
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
                  {message.user.first_name ||
                    message.user.username ||
                    "Unknown User"}{" "}
                  •{" "}
                  {message.created_at
                    ? new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sending..."}
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
          disabled={newMessageText.trim() === "" || !isConnected}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
