"use client";

import ChatListItem from "./ChatListItem";
import { User } from "../../store/types";
import { Loader2 } from "lucide-react";
import Button from "../ui/Button";

interface ChatListProps {
  conversations: User[];
  selectedUserId: number | null;
  onSelectConversation: (userId: number) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function ChatList({
  conversations,
  selectedUserId,
  onSelectConversation,
  isLoading,
  error,
  onRetry,
}: ChatListProps) {
  return (
    <div className="flex flex-col h-full bg-background dark:bg-background-dark overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground dark:text-muted-foreground-dark">
          <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary dark:text-primary-dark" />
          <p>Loading chats...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full text-destructive dark:text-destructive-dark text-center p-4">
          <p className="mb-2">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Retry Loading Chats
          </Button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-muted-foreground dark:text-muted-foreground-dark py-10 px-5">
          No conversations yet. Book sessions to start chatting!
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((user) => (
            <ChatListItem
              key={user.id}
              user={user}
              isSelected={selectedUserId === user.id}
              onSelect={onSelectConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
