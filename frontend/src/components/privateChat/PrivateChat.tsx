"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User as UserIcon, ArrowLeft } from "lucide-react";
import Button from "../ui/Button"; // Adjust path as needed
import { useAuthStore } from "../../store/authStore"; // Adjust path as needed
import { apiClient } from "../../services/api"; // Adjust path as needed
import { User } from "../../store/types"; // Adjust path as needed

export interface PrivateMessageSend {
  // id: number | string;
  message: string;
  // created_at: string;
  is_group_chat: boolean;
  other_user_id: number;
  room_name: string;
}export interface PrivateMessageResponse {
  id: number | string;
  message: string;
  created_at: string;
  is_group_chat: boolean;
  other_user_id: number;
}

export default function PrivateChat({
  other_user_id,
  onBackToList,
}: PrivateMessageSend & {onBackToList?: () => void}) {
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<PrivateMessageResponse[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isValidChat = user?.id && other_user_id !== null && !isNaN(other_user_id);

  useEffect(() => {
    if (!isValidChat || !accessToken) {
      if (!user?.id) setError("User not authenticated.");
      else if (other_user_id === null || isNaN(other_user_id))
        setError("Invalid chat partner ID.");
      setIsLoading(false);
      return;
    }

    const fetchChatData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userResponse = await apiClient.get(`/users/${other_user_id}/`);
        setOtherUser(userResponse.data);

        const response = await apiClient.get(
          `/chatbot/private/${other_user_id}/`
        );
        console.log(response.data)

        setMessages(
          response.data.sort(
            (a: PrivateMessageResponse, b: PrivateMessageResponse) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
        );
      } catch (err) {
        console.error("Error fetching chat data:", err);
        setError("Failed to load chat.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [user?.id, other_user_id, accessToken, isValidChat]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (!isLoading && messages.length === 0) {
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isSending || !isValidChat) return;

    setIsSending(true);
    setError(null);
    const tempId = `temp-${Date.now()}`;

    const messageToSend = inputText;
    setInputText("");

    try {
      const newMessagePayload = {
        is_group_chat: false,
        message: messageToSend,
        room_name: user!.username,
        other_user_id: other_user_id,
      };

      const optimisticMessage: PrivateMessageResponse = {
        id: tempId,
        // sender: user!.id,
        // receiver: other_user_id!,
        message: messageToSend,
        // message_type: "text",
        created_at: new Date().toISOString(),
        is_group_chat: false,
        other_user_id: other_user_id
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      const response = await apiClient.post(
        "/chatbot/sendMessage/",
        newMessagePayload
      );

      const actualMessage = response.data;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? actualMessage : msg))
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");

      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setInputText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending && inputText.trim() !== "") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);

    const fetchChatData = async () => {
      if (!isValidChat || !accessToken) {
        setError("User not authenticated or invalid chat partner.");
        setIsLoading(false);
        return;
      }
      try {
        const userResponse = await apiClient.get(`/users/${other_user_id}/`);
        setOtherUser(userResponse.data);
        const response = await apiClient.get(
          `/chatbot/private/${other_user_id}/`
        );
        setMessages(
          response.data.sort(
            (a: PrivateMessageResponse, b: PrivateMessageResponse) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
        );
      } catch (err) {
        console.error("Error fetching chat data on retry:", err);
        setError("Failed to reload chat.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChatData();
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Time";
    }
  };

  const getUserAvatar = (userData: User | null) => {
    if (!userData) return <UserIcon size={20} className="text-muted-foreground dark:text-muted-foreground-dark" />;

    return userData.profile_picture ? (
      <img
        src={userData.profile_picture}
        alt={userData.first_name || userData.username || "User"}
        className="object-cover w-full h-full"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    ) : (
      <div className="flex items-center justify-center h-full w-full bg-primary/20 text-sm font-semibold text-primary dark:bg-primary-dark/20 dark:text-primary-dark">
        {userData.first_name?.charAt(0) || userData.username?.charAt(0) || "U"}
      </div>
    );
  };

  if (!isValidChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive dark:text-destructive-dark p-4 text-center bg-background dark:bg-background-dark">
        <p className="mb-2">{error || "Invalid chat setup."}</p>
        {error && (
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background dark:bg-background-dark border-l border-border dark:border-border-dark">
      {" "}
      <div className="bg-card dark:bg-card-dark p-4 border-b border-border dark:border-border-dark flex items-center justify-between flex-shrink-0">
        {" "}
        <div className="flex items-center space-x-3">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground-dark dark:hover:text-foreground-dark sm:hidden"
              aria-label="Back to chat list"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 border border-border dark:border-border-dark">
            {isLoading && !otherUser ? (
              <div className="w-full h-full bg-muted dark:bg-muted-dark animate-pulse rounded-full"></div>
            ) : (
              getUserAvatar(otherUser)
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground-dark">
              {isLoading && !otherUser
                ? "Loading..."
                : otherUser?.first_name || otherUser?.username || "User"}
            </h2>

            <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">Online</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground dark:text-muted-foreground-dark">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary dark:text-primary-dark" />
            <p>Loading messages...</p>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive dark:text-destructive-dark text-center">
            <p className="mb-2">{error}</p>
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground dark:text-muted-foreground-dark py-10">
            No messages yet with{" "}
            {otherUser?.first_name || otherUser?.username || "this user"}. Start
            the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.other_user_id !== user?.id;
            const key = message.id
              ? message.id.toString()
              : `temp-${message.created_at}-${message.created_at}`;

            return (
              <div
                key={key}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-border dark:border-border-dark">
                    {isUser ? getUserAvatar(user) : getUserAvatar(otherUser)}
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
                        ? "bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
                        : "bg-muted text-foreground dark:bg-muted-dark dark:text-foreground-dark"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <span
                    className={`text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1 ${
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
      <div className="border-t border-border dark:border-border-dark p-3 bg-card dark:bg-card-dark flex-shrink-0">
        {" "}
        {error && messages.length > 0 && (
          <div className="text-destructive dark:text-destructive-dark text-sm mb-2 text-center">{error}</div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isSending
                ? "Sending..."
                : isLoading
                ? "Loading chat..."
                : !isValidChat
                ? "Cannot chat"
                : "Type your message..."
            }
            className="flex-1 px-4 py-2 border border-input dark:border-input-dark rounded-full focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring-dark focus:border-ring dark:focus:border-ring-dark text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isSending || isLoading || !isValidChat}
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              inputText.trim() === "" || isSending || isLoading || !isValidChat
            }
            className="p-2 rounded-full"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary dark:text-primary-dark" />
            ) : (
              <Send size={20} className="text-primary-foreground dark:text-primary-foreground-dark" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
