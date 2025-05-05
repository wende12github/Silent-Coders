import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User as UserIcon } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "../services/api";
import { User } from "../store/types";

interface PrivateMessage {
  id: number;
  sender: number;
  receiver: number;
  message: string;
  message_type: string;
  created_at: string;
}

interface PrivateChatProps {
  otherUserId: number;
  onClose?: () => void;
}

export default function PrivateChat({ otherUserId, onClose }: PrivateChatProps) {
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a consistent room name based on user IDs
  const roomName = `private_${Math.min(user?.id || 0, otherUserId)}_${Math.max(
    user?.id || 0,
    otherUserId
  )}`;

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user?.id || !accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch other user's details
        const userResponse = await apiClient.get(`/users/${otherUserId}/`);
        setOtherUser(userResponse.data);

        // Fetch chat messages
        const response = await apiClient.get(
          `/chatbot/private/${otherUserId}/`
        );
        setMessages(response.data);
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setError("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [user?.id, otherUserId, accessToken]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isSending || !user?.id) return;

    setIsSending(true);
    setError(null);

    try {
      const newMessage = {
        is_group_chat: false,
        message: inputText,
        room_name: roomName,
        other_user_id: otherUserId,
      };

      // Optimistically add the message to UI
      const tempId = Date.now(); // Temporary ID for optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: user.id,
          receiver: otherUserId,
          message: inputText,
          message_type: "text",
          created_at: new Date().toISOString(),
        },
      ]);

      // Send to API
      const response = await apiClient.post(
        "/chatbot/sendMessage/",
        newMessage
      );

      // Replace optimistic message with actual response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== tempId),
        response.data,
      ]);
      
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserAvatar = (user: User | null) => {
    if (!user) return <UserIcon size={20} />;
    
    return user.profile_picture ? (
      <img
        src={user.profile_picture}
        alt={user.first_name || "User"}
        className="object-cover w-full h-full"
      />
    ) : (
      <div className="flex items-center justify-center h-full w-full bg-blue-200 text-sm font-semibold text-blue-800">
        {user.first_name?.charAt(0) || user.username?.charAt(0) || "U"}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 border border-gray-300">
            {getUserAvatar(otherUser)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {otherUser?.first_name || "Loading..."}
            </h2>
            <p className="text-xs text-gray-500">
              {isLoading ? "Loading..." : "Online"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.sender === user?.id;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-gray-300">
                    {isUser
                      ? getUserAvatar(user)
                      : getUserAvatar(otherUser)}
                  </div>
                </div>

                <div
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-xs sm:max-w-sm lg:max-w-md break-words ${
                      isUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <span
                    className={`text-xs text-gray-500 mt-1 ${
                      isUser ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        {error && (
          <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isSending ? "Sending message..." : "Type your message..."
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={inputText.trim() === "" || isSending}
            className="p-2 rounded-full"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}