// components/PrivateChat.tsx (or keep the name ChatPage if you prefer)
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User as UserIcon, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon
import Button from "../ui/Button"; // Assuming your Button component
import { useAuthStore } from "../../store/authStore"; // Assuming your auth store
import { apiClient } from "../../services/api"; // Assuming your API client
import { User } from "../../store/types"; // Assuming your User type
// Removed: import { useParams } from 'react-router-dom';

interface PrivateMessage {
  id: number | string; // Allow string for optimistic temp ID
  sender: number;
  receiver: number;
  message: string;
  message_type: string; // e.g., "text"
  created_at: string;
}

interface PrivateChatProps {
  otherUserId: number;
  onBackToList?: () => void; // Add an optional prop to go back (for mobile)
}

// This component now accepts otherUserId as a prop
export default function PrivateChat({ otherUserId, onBackToList }: PrivateChatProps) {
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if the required data (current user and target user ID) is available
   const isValidChat = user?.id && otherUserId !== null && !isNaN(otherUserId);

    useEffect(() => {
        if (!isValidChat || !accessToken) {
            if (!user?.id) setError("User not authenticated.");
            else if (otherUserId === null || isNaN(otherUserId)) setError("Invalid chat partner ID.");
            setIsLoading(false);
            return;
        }

        const fetchChatData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch other user's details
                const userResponse = await apiClient.get(`/users/${otherUserId}/`);
                setOtherUser(userResponse.data);

                // Fetch chat messages
                const response = await apiClient.get(`/chatbot/private/${otherUserId}/`);
                // Ensure messages are sorted if necessary, e.g., by created_at
                setMessages(response.data.sort((a: PrivateMessage, b: PrivateMessage) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

            } catch (err) {
                console.error("Error fetching chat data:", err);
                setError("Failed to load chat.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatData();
    }, [user?.id, otherUserId, accessToken, isValidChat]); // Depend on necessary values


   // Auto-scroll to bottom when messages change or loading finishes
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
             messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (!isLoading && messages.length === 0) {
            // If loaded and no messages, no need to scroll
        }
    }, [messages, isLoading]); // Scroll after messages update AND after initial load

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isSending || !isValidChat) return;

    setIsSending(true);
    setError(null);
    const tempId = `temp-${Date.now()}`; // Use a string temp ID

    const messageToSend = inputText; // Store before clearing input
    setInputText(""); // Clear input immediately

    try {
      const newMessagePayload = {
        is_group_chat: false,
        message: messageToSend,
        // room_name: `private_${Math.min(user!.id, otherUserId!)}_${Math.max(user!.id, otherUserId!)}`, // Backend might generate this
        other_user_id: otherUserId,
      };

      // Optimistically add the message to UI
      const optimisticMessage: PrivateMessage = {
          id: tempId,
          sender: user!.id, // Use non-null assertion based on isValidChat check
          receiver: otherUserId!, // Use non-null assertion
          message: messageToSend,
          message_type: "text",
          created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      // Send to API
      const response = await apiClient.post("/chatbot/sendMessage/", newMessagePayload);

      // Assuming the backend returns the actual message object upon success
      const actualMessage = response.data;

      // Replace optimistic message with actual response
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? actualMessage : msg))
      );

    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      // Optionally remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
       // Restore input text if sending failed and you removed the message
       // setInputText(messageToSend); // Could add this
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear error when typing
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
        // Re-fetch chat data
        const fetchChatData = async () => {
            if (!isValidChat || !accessToken) {
                setError("User not authenticated or invalid chat partner.");
                setIsLoading(false);
                return;
            }
            try {
                 const userResponse = await apiClient.get(`/users/${otherUserId}/`);
                 setOtherUser(userResponse.data);
                 const response = await apiClient.get(`/chatbot/private/${otherUserId}/`);
                 setMessages(response.data.sort((a: PrivateMessage, b: PrivateMessage) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
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
       if (!userData) return <UserIcon size={20} />;

       return userData.profile_picture ? (
         <img
           src={userData.profile_picture}
           alt={userData.first_name || userData.username || "User"}
           className="object-cover w-full h-full"
           onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
         />
       ) : (
         <div className="flex items-center justify-center h-full w-full bg-blue-200 text-sm font-semibold text-blue-800">
           {userData.first_name?.charAt(0) || userData.username?.charAt(0) || "U"}
         </div>
       );
   };

   if (!isValidChat) {
       return (
           <div className="flex flex-col items-center justify-center h-full text-red-600 p-4 text-center">
               <p className="mb-2">{error || "Invalid chat setup."}</p>
               {error && <Button onClick={handleRetry} variant="outline">Retry</Button>}
           </div>
       );
   }


  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200"> {/* Ensure it takes full height of parent */}
      {/* Chat header */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"> {/* flex-shrink-0 to prevent shrinking */}
        <div className="flex items-center space-x-3">
            {onBackToList && ( // Show back button on mobile if provided
                <button onClick={onBackToList} className="text-gray-500 hover:text-gray-700 sm:hidden">
                    <ArrowLeft size={24} />
                </button>
            )}
          <div className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 border border-gray-300">
             {isLoading && !otherUser ? <div className="w-full h-full bg-gray-200 animate-pulse rounded-full"></div> : getUserAvatar(otherUser)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {isLoading && !otherUser ? "Loading..." : otherUser?.first_name || otherUser?.username || "User"}
            </h2>
             {/* You might display online status here if available */}
             <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        {/* Add other header actions if needed */}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading messages...</p>
          </div>
        ) : error && messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-red-500 text-center">
              <p className="mb-2">{error}</p>
               <Button onClick={handleRetry} variant="outline">Retry</Button>
           </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No messages yet with {otherUser?.first_name || otherUser?.username || "this user"}. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.sender === user?.id;
            const key = message.id ? message.id.toString() : `temp-${message.created_at}-${message.sender}`; // Ensure key is string

            return (
              <div
                key={key}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-gray-300">
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
      <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0"> {/* flex-shrink-0 to prevent shrinking */}
        {error && messages.length > 0 && (
          <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isSending ? "Sending..." : isLoading ? "Loading chat..." : !isValidChat ? "Cannot chat" : "Type your message..."
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isSending || isLoading || !isValidChat}
          />
          <Button
            onClick={handleSendMessage}
            disabled={inputText.trim() === "" || isSending || isLoading || !isValidChat}
            className="p-2 rounded-full"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <Send size={20} className="text-blue-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}