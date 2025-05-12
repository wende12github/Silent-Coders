import ChatListItem from "./ChatListItem";

import { ChatUser } from "../../store/types";
import { Loader2 } from "lucide-react";
import Button from "../ui/Button";

interface ChatListProps {
  conversations: ChatUser[] | null;
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
  const hasItems = conversations && conversations.length > 0;

  return (
    <div className="flex flex-col h-full bg-background dark:bg-background-dark overflow-y-auto">
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground dark:text-muted-foreground-dark">
          <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary dark:text-primary-dark" />
          <p>Loading chats...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center h-full text-destructive dark:text-destructive-dark text-center p-4">
          <p className="mb-2">{error}</p>

          <Button onClick={onRetry} variant="outline">
            Retry Loading Chats
          </Button>
        </div>
      )}

      {!isLoading && !error && !hasItems && (
        <div className="text-center text-muted-foreground dark:text-muted-foreground-dark py-10 px-5">
          No conversations yet. Book sessions or interact with users to start
          chatting!
        </div>
      )}

      {!isLoading && !error && hasItems && (
        <div className="flex-1 overflow-y-auto">
          {conversations!.map((chatUser) => (
            <ChatListItem
              key={chatUser.id}
              chatUser={chatUser}
              isSelected={selectedUserId === chatUser.id}
              onSelect={onSelectConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
