// components/ChatList.tsx
import ChatListItem from "./ChatListItem"; // Assuming ChatListItem is in the same components folder
import { User } from "../../store/types"; // Assuming your User type
import { Loader2 } from "lucide-react";
import Button from "../ui/Button"; // Assuming your Button component

interface ChatListProps {
  conversations: User[]; // This should ideally be a Conversation type with last message info
  selectedUserId: number | null;
  onSelectConversation: (userId: number) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void; // Add retry for list loading
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
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Optional: Add a search bar here */}
      {/* <div className="p-4 border-b border-gray-200">
            <input type="text" placeholder="Search chats..." className="w-full px-3 py-2 border rounded-md"/>
        </div> */}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading chats...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full text-red-500 text-center p-4">
          <p className="mb-2">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Retry Loading Chats
          </Button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No conversations yet.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {" "}
          {/* Ensure list items scroll */}
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
