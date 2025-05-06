"use client";

import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import PrivateChat from "./PrivateChat";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../services/api";
import { User } from "../../store/types";

export default function ChatLayout() {
  const { user, accessToken } = useAuthStore();
  const [conversations, setConversations] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user?.id || !accessToken) {
      setIsListLoading(false);
      setListError("User not authenticated.");
      return;
    }
    setIsListLoading(true);
    setListError(null);
    try {
      const response = await apiClient.get(`/chatbot/private/${user.id}/`);
      console.log(`/chatbot/private/${user.id}/`);
      console.log("Conversations response:", response.data);
      // const filteredUsers = response.data.filter((u: User) => u.id !== user.id);
      setConversations(response.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setListError("Failed to load conversations.");
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  // const resp = apiClient.post(`/chatbot/sendMessage/`, { //test
  //   is_group_chat: false,
  //   message: "Hello",
  //   other_user_id: 2,
  //   room_name: "test",
  // });
  //   resp.then((r) => r.data).then(e=>{
  //     console.log(e)
  // console.log("I am User", user?.id)
// })

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
  };

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const showChatOnly = isMobile && selectedUserId !== null;
  const showListOnly = isMobile && selectedUserId === null;

  return (
    <div className="flex flex-grow antialiased text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
      <div className="flex flex-row h-full w-full overflow-hidden">
        <div
          className={`flex flex-col ${
            showChatOnly ? "hidden" : "w-full sm:w-80"
          } flex-shrink-0 border-r border-border dark:border-border-dark bg-card dark:bg-card-dark transition-all duration-300 ease-in-out`}
        >
          <div className="p-4 border-b border-border dark:border-border-dark">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              Chats
            </h2>
          </div>

          <ChatList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            isLoading={isListLoading}
            error={listError}
            onRetry={fetchConversations}
          />
        </div>

        <div
          className={`flex-1 flex flex-col ${
            showListOnly ? "hidden" : ""
          } sm:block bg-background dark:bg-background-dark transition-all duration-300 ease-in-out`}
        >
          {selectedUserId !== null ? (
            <PrivateChat
              room_name="hello"
              other_user_id={selectedUserId}
              onBackToList={handleBackToList}
              is_group_chat={false}
              message={""}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground dark:text-muted-foreground-dark text-lg p-4">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
