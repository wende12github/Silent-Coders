import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, User as UserIcon, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useWebSocketStore } from "../../store/webSocketStore";

import { apiClient } from "../../services/api";
import { getPrivateMessages } from "../../services/message";

import { User, PrivateChatMessage } from "../../store/types";
import { Navigate } from "react-router-dom";

interface PrivateChatProps {
  other_user_id: number;
  onBackToList?: () => void;
}

export default function PrivateChat({
  other_user_id,
  onBackToList,
}: PrivateChatProps) {
  const { user, accessToken } = useAuthStore();
  if (!user) return <Navigate to="/login" />;

  const {
    isConnected: isWsConnected,
    isLoading: isWsConnecting,
    error: wsError,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    sendMessage: sendWebSocketMessage,
    addHandler: addWebSocketHandler,
    removeHandler: removeWebSocketHandler,
  } = useWebSocketStore();

  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user.id;
  const room_name =
    other_user_id != null && !isNaN(other_user_id)
      ? `${Math.min(currentUserId, other_user_id)}_${Math.max(
          currentUserId,
          other_user_id
        )}`
      : null;

  const isValidChat = currentUserId != null && room_name !== null;

  const handleIncomingMessage = useCallback(
    (event: MessageEvent) => {
      console.log(
        "PrivateChat: Processing incoming WebSocket message:",
        event.data
      );
      try {
        const data = JSON.parse(event.data);

        let senderUser: Partial<User> | undefined;
        if (data.user === user?.username) {
          senderUser = user;
        } else if (otherUser && data.user === otherUser.username) {
          senderUser = otherUser;
        } else {
          console.warn(
            "PrivateChat: Received message from unknown user:",
            data.user
          );

          senderUser = {
            id: 0,
            username: data.user,
            first_name: data.user,
            last_name: "",
            email: "",
            profile_picture: null,
          };
        }

        if (senderUser && otherUser) {
          const newMessage: PrivateChatMessage = {
            id: Date.now() + Math.random(),
            sender: senderUser,

            receiver: senderUser.id === user?.id ? otherUser : user,
            message: data.message,
            message_type: data.message_type || "text",
            created_at: new Date().toISOString(),
            is_read: true,
          };

          if (senderUser.id !== user?.id) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          } else {
            console.log(
              "PrivateChat: Received echo of own message, not adding again."
            );
          }
        } else {
          console.error(
            "PrivateChat: Could not determine sender or otherUser for received message:",
            data
          );
        }
      } catch (e) {
        console.error("PrivateChat: Failed to parse WebSocket message:", e);
      }
    },
    [user, otherUser]
  );

  useEffect(() => {
    if (!isValidChat || !accessToken) {
      let errorMessage = "";
      if (!user?.id) errorMessage = "User not authenticated.";
      else if (other_user_id === null || isNaN(other_user_id))
        errorMessage = "Invalid chat partner ID.";
      else if (!accessToken) errorMessage = "Authentication token missing.";
      else errorMessage = "Invalid chat setup.";

      setInitialDataError(errorMessage);
      setIsLoadingInitialData(false);
      setMessages([]);
      setOtherUser(null);
      return;
    }

    const fetchChatData = async () => {
      setIsLoadingInitialData(true);
      setInitialDataError(null);

      try {
        const userResponse = await apiClient.get(`/users/${other_user_id}/`);
        setOtherUser(userResponse.data as User);

        const fetchedMessages: PrivateChatMessage[] = await getPrivateMessages(
          other_user_id,
          0,
          50
        );
        console.log(
          `PrivateChat: Fetched ${fetchedMessages.length} messages for user ${other_user_id}`,
          fetchedMessages
        );
        setMessages(fetchedMessages);
      } catch (err: any) {
        console.error("PrivateChat: Error fetching initial chat data:", err);
        setInitialDataError(err.message || "Failed to load initial chat data.");
        setMessages([]);
        setOtherUser(null);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchChatData();

    if (room_name) {
      console.log(
        `PrivateChat: Attempting WebSocket connection for room: ${room_name}`
      );
      connectWebSocket("user", room_name);
    }

    return () => {
      console.log("PrivateChat: Cleaning up effects.");

      disconnectWebSocket();
    };
  }, [
    user?.id,
    other_user_id,
    accessToken,
    isValidChat,
    room_name,
    connectWebSocket,
    disconnectWebSocket,
  ]);

  useEffect(() => {
    addWebSocketHandler(handleIncomingMessage);
    console.log("PrivateChat: Added WebSocket message handler.");

    return () => {
      removeWebSocketHandler(handleIncomingMessage);
      console.log("PrivateChat: Removed WebSocket message handler.");
    };
  }, [addWebSocketHandler, removeWebSocketHandler, handleIncomingMessage]);

  useEffect(() => {
    if (
      !isLoadingInitialData &&
      (isWsConnected || (!isWsConnecting && !wsError))
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingInitialData, isWsConnected, isWsConnecting, wsError]);

  const handleSendMessage = async () => {
    if (
      inputText.trim() === "" ||
      isSending ||
      !isValidChat ||
      !user ||
      !otherUser ||
      !isWsConnected
    ) {
      if (!isWsConnected) {
        console.warn(
          "PrivateChat: Attempted to send message, but WebSocket is not connected."
        );
      } else if (!isValidChat || !user || !otherUser) {
        console.warn(
          "PrivateChat: Attempted to send message in invalid chat state."
        );
      }
      return;
    }

    setIsSending(true);

    const messageToSend = inputText.trim();
    setInputText("");

    const optimisticMessage: PrivateChatMessage = {
      id: Date.now() + Math.random(),
      sender: user,
      receiver: otherUser,
      message: messageToSend,
      message_type: "text",
      created_at: new Date().toISOString(),
      is_read: true,
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const messagePayload = {
        message: messageToSend,
        message_type: "text",
      };
      sendWebSocketMessage(messagePayload);
      console.log(
        "PrivateChat: Message sent via WebSocket store:",
        messagePayload
      );
    } catch (err: any) {
      console.error(
        "PrivateChat: Error sending message via WebSocket (caught in component):",
        err
      );

      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== optimisticMessage.id)
      );

      setInputText(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitialDataError(null);

    setInputText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && inputText.trim() !== "") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    if (isValidChat && accessToken) {
      const refetchAndConnect = async () => {
        setIsLoadingInitialData(true);
        setInitialDataError(null);

        try {
          const userResponse = await apiClient.get(`/users/${other_user_id}/`);
          setOtherUser(userResponse.data as User);

          const fetchedMessages: PrivateChatMessage[] =
            await getPrivateMessages(other_user_id, 0, 50);
          setMessages(fetchedMessages);

          if (room_name) {
            console.log(
              `PrivateChat: Retry triggered, attempting WebSocket connection for room: ${room_name}`
            );
            connectWebSocket("user", room_name);
          }
        } catch (err: any) {
          console.error("PrivateChat: Error fetching chat data on retry:", err);
          setInitialDataError(err.message || "Failed to reload chat.");
          setMessages([]);
          setOtherUser(null);
        } finally {
          setIsLoadingInitialData(false);
        }
      };
      refetchAndConnect();
    } else {
      setInitialDataError("Cannot retry: Invalid chat state.");
    }
  };

  const formatTime = (isoString: string) => {
    try {
      if (!isoString) return "Invalid Time";
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "Invalid Time";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("PrivateChat: Error formatting time:", e);
      return "Invalid Time";
    }
  };

  const getUserAvatar = (userData: User | null | undefined) => {
    if (!userData) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-muted dark:bg-muted-dark text-muted-foreground dark:text-muted-foreground-dark">
          <UserIcon size={20} />
        </div>
      );
    }

    return userData.profile_picture ? (
      <img
        src={userData.profile_picture}
        alt={userData.first_name || userData.username || "User"}
        className="object-cover w-full h-full rounded-full"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    ) : (
      <div className="flex items-center justify-center h-full w-full bg-primary/20 text-sm font-semibold text-primary dark:bg-primary-dark/20 dark:text-primary-dark rounded-full">
        {(
          userData.first_name?.charAt(0) ||
          userData.username?.charAt(0) ||
          "U"
        ).toUpperCase()}
      </div>
    );
  };

  if (!isValidChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive dark:text-destructive-dark p-4 text-center bg-background dark:bg-background-dark">
        <p className="mb-2">{initialDataError || "Invalid chat setup."}</p>

        {initialDataError && (
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        )}
      </div>
    );
  }

  const isOverallLoading = isLoadingInitialData || isWsConnecting;

  const overallError = initialDataError || wsError;

  return (
    <div className="flex flex-col h-full bg-background dark:bg-background-dark border-l border-border dark:border-border-dark">
      <div className="bg-card dark:bg-card-dark p-4 border-b border-border dark:border-border-dark flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground-dark dark:hover:text-foreground-dark md:hidden"
              aria-label="Back to chat list"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 border border-border dark:border-border-dark">
            {isLoadingInitialData && !otherUser ? (
              <div className="w-full h-full bg-muted dark:bg-muted-dark animate-pulse rounded-full"></div>
            ) : (
              getUserAvatar(otherUser)
            )}
          </div>

          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground-dark truncate">
              {isLoadingInitialData && !otherUser
                ? "Loading..."
                : otherUser?.first_name || otherUser?.username || "User"}
            </h2>

            {otherUser && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                {isWsConnected ? "Online" : "Offline"}{" "}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoadingInitialData && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground dark:text-muted-foreground-dark">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary dark:text-primary-dark" />
            <p>Loading messages...</p>
          </div>
        ) : !isLoadingInitialData &&
          initialDataError &&
          messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive dark:text-destructive-dark text-center">
            <p className="mb-2">{initialDataError}</p>

            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          </div>
        ) : !isLoadingInitialData &&
          !initialDataError &&
          messages.length === 0 ? (
          <div className="text-center text-muted-foreground dark:text-muted-foreground-dark py-10">
            No messages yet with{" "}
            {otherUser?.first_name || otherUser?.username || "this user"}. Start
            the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUserMessage = message.sender.id === user?.id;

            const key =
              typeof message.id === "string"
                ? message.id
                : message.id.toString();

            return (
              <div
                key={key}
                className={`flex items-start gap-3 ${
                  isCurrentUserMessage ? "flex-row-reverse overflow-y-auto " : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-border dark:border-border-dark">
                    {isCurrentUserMessage
                      ? getUserAvatar(user)
                      : getUserAvatar(otherUser)}{" "}
                  </div>
                </div>

                <div
                  className={`flex flex-col ${
                    isCurrentUserMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-xs sm:max-w-sm lg:max-w-md break-words ${
                      isCurrentUserMessage
                        ? "bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
                        : "bg-muted text-foreground dark:bg-muted-dark dark:text-foreground-dark"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>{" "}
                  </div>

                  <span
                    className={`text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1 ${
                      isCurrentUserMessage ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.created_at)}{" "}
                  </span>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border dark:border-border-dark p-3 bg-card dark:bg-card-dark flex-shrink-0">
        {overallError && messages.length > 0 && (
          <div className="text-destructive dark:text-destructive-dark text-sm mb-2 text-center">
            {overallError}
          </div>
        )}

        {!isWsConnected && !isWsConnecting && messages.length > 0 && (
          <div className="text-muted-foreground dark:text-muted-foreground-dark text-sm mb-2 text-center">
            WebSocket disconnected. Messages may not update in real-time.
          </div>
        )}
        {isWsConnecting && messages.length > 0 && (
          <div className="text-muted-foreground dark:text-muted-foreground-dark text-sm mb-2 text-center flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-1" /> Connecting...
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isOverallLoading
                ? "Loading chat..."
                : isSending
                ? "Sending..."
                : !isValidChat || !otherUser
                ? "Cannot chat"
                : !isWsConnected
                ? "Connecting..."
                : "Type your message..."
            }
            className="flex-1 px-4 py-2 border border-input dark:border-input-dark rounded-full focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring-dark focus:border-ring dark:focus:border-ring-dark text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={
              isOverallLoading ||
              isSending ||
              !isValidChat ||
              !otherUser ||
              !isWsConnected
            }
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              inputText.trim() === "" ||
              isSending ||
              isOverallLoading ||
              !isValidChat ||
              !otherUser ||
              !isWsConnected
            }
            className="p-2 rounded-full"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary-foreground dark:text-primary-dark" />
            ) : (
              <Send
                size={20}
                className="text-primary-foreground dark:text-primary-foreground-dark"
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
