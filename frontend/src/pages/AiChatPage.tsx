import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore"; // Zustand store for chat

export default function AiChatPage() {
  const { user } = useAuthStore();
  const { messages, sendMessage } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

    setError(null);
    setIsLoading(true);
    try {
      await sendMessage(inputText);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError("Failed to get reply from chatbot.");
    } finally {
      setInputText("");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col flex-grow bg-gray-100">
      <div className="bg-white shadow-sm p-4 flex items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-800">Chatbot</h1>
      </div>

      <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-500 mt-10">
            Start a conversation with the chatbot!
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex-shrink-0 ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                {isUser ? (
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-gray-300">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.first_name || "User"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-blue-200 text-sm font-semibold text-blue-800">
                        {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-200 text-green-800">
                    <Bot size={20} />
                  </div>
                )}
              </div>

              <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-lg p-3 max-w-xs sm:max-w-sm lg:max-w-md break-words ${
                    isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}>
                  {isUser ? (user?.first_name || "You") : "Bot"} • {formatTime()}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Bot is thinking...</span>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm mt-4">{error}</div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 flex items-center gap-3 bg-white">
        <input
          type="text"
          placeholder={isLoading ? "Waiting for reply..." : "Type your message..."}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={inputText.trim() === "" || isLoading}
          className="p-2 rounded-full"
          aria-label="Send message"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
