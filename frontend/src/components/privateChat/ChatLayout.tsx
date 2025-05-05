// pages/ChatLayout.tsx (or wherever you want your main chat page)
import { useState, useEffect } from 'react';
import ChatList from './ChatList'; // Adjust path
import PrivateChat from './PrivateChat'; // Adjust path
import { useAuthStore } from '../../store/authStore'; // Assuming your auth store
import { apiClient } from '../../services/api'; // Assuming your API client
import { User } from '../../store/types'; // Assuming your User type

// This component provides the Telegram-like layout
export default function ChatLayout() {
  const { user, accessToken } = useAuthStore();
  const [conversations, setConversations] = useState<User[]>([]); // State for the list of users/chats
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // State for the currently selected user
  const [isListLoading, setIsListLoading] = useState(true); // Loading state for the conversation list
  const [listError, setListError] = useState<string | null>(null);

  // --- Fetch list of conversations/users ---
  console.log('User:', user?.id, 'Token:', accessToken); // Add this before the API call
  const fetchConversations = async () => {
     if (!user?.id || !accessToken) {
          setIsListLoading(false);
          setListError("User not authenticated."); // Or handle authentication flow
          return;
     }
     setIsListLoading(true);
     setListError(null);
     try {
        // TODO: Replace with your actual API call to get recent chats or contacts
        // This is a placeholder: fetching all users except the current one
        const response = await apiClient.get('/users/');
        // Filter out the current user
        const filteredUsers = response.data.filter((u: User) => u.id !== user.id);
        setConversations(filteredUsers);
     } catch (err) {
        console.error("Error fetching conversations:", err);
        setListError("Failed to load conversations.");
     } finally {
        setIsListLoading(false);
     }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id, accessToken]); // Re-fetch if user or token changes

  // --- Handle conversation selection ---
  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    // On mobile, you might want to hide the list here and show the chat
    // This is handled by responsive CSS classes below
  };

    // --- Handle back button on mobile ---
    const handleBackToList = () => {
        setSelectedUserId(null);
    };

  // --- Determine layout based on screen size and selection ---
  // We need to check if a user is selected AND if we are on a small screen
  const isMobile = window.innerWidth < 768; // Example breakpoint for 'sm'
  const showChatOnly = isMobile && selectedUserId !== null;
  const showListOnly = isMobile && selectedUserId === null; // Also shows list if not mobile and nothing selected

  // You might need to use state and a useEffect to track window size
  // For simplicity here, using window.innerWidth directly, but a hook is better practice
  // const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  // useEffect(() => {
  //    const handleResize = () => setIsMobileView(window.innerWidth < 768);
  //    window.addEventListener('resize', handleResize);
  //    return () => window.removeEventListener('resize', handleResize);
  // }, []);
  // const showChatOnly = isMobileView && selectedUserId !== null;
  // const showListOnly = isMobileView ? selectedUserId === null : true; // Always show list on desktop


  return (
    <div className="flex h-screen antialiased text-gray-800"> {/* Full screen height flex container */}
      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Left Pane: Chat List */}
        <div className={`flex flex-col ${showChatOnly ? 'hidden' : 'w-80'} sm:w-80 flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out`}>
            <div className="p-4 border-b border-gray-200">
                 <h2 className="text-xl font-semibold">Chats</h2>
                 {/* Optional: Add search input here */}
            </div>
           <ChatList
             conversations={conversations}
             selectedUserId={selectedUserId}
             onSelectConversation={handleSelectConversation}
             isLoading={isListLoading}
             error={listError}
             onRetry={fetchConversations} // Pass the fetch function for retry
           />
        </div>

        {/* Right Pane: Chat Window or Placeholder */}
        <div className={`flex-1 flex flex-col ${showListOnly ? 'hidden' : ''} sm:block bg-gray-50 transition-all duration-300 ease-in-out`}>
          {selectedUserId !== null ? (
            <PrivateChat otherUserId={selectedUserId} onBackToList={handleBackToList} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg p-4">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}