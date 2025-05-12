import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import ChatList from "./ChatList";
import PrivateChat from "./PrivateChat";
import { useAuthStore } from "../../store/authStore";
import { getPrivateConversations } from "../../services/message";
import { fetchMyBookings } from "../../services/booking";
import { fetchPublicUser } from "../../services/user";
import { ChatUser, PrivateConversation, Booking } from "../../store/types";
import { toast } from "sonner";

export default function ChatLayout() {
  const { user, accessToken } = useAuthStore();

  const { userId: userIdParam } = useParams<{ userId?: string }>();

  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userIdParam ? parseInt(userIdParam, 10) : null
  );

  const [isListLoading, setIsListLoading] = useState(true);

  const [listError, setListError] = useState<string | null>(null);

  const fetchChatData = useCallback(async () => {
    if (!user?.id || !accessToken) {
      setIsListLoading(false);
      setChatUsers([]);
      setListError("Authentication required to load chats.");

      if (userIdParam) {
        setSelectedUserId(null);
      }
      return;
    }

    setIsListLoading(true);
    setListError(null);

    try {
      const conversationsData: PrivateConversation[] =
        await getPrivateConversations();
      console.log("Conversations fetched:", conversationsData);

      const bookingsResponse = await fetchMyBookings();
      const bookingsData: Booking[] = bookingsResponse;
      console.log("Bookings fetched:", bookingsData);

      const uniqueUsersMap = new Map<number, ChatUser>();

      conversationsData.forEach((conv) => {
        const otherUser = conv.other_user;
        uniqueUsersMap.set(otherUser.id, {
          id: otherUser.id,
          username: otherUser.username,
          profile_picture: otherUser.profile_picture,
          first_name: otherUser.first_name,
          last_name: otherUser.last_name,
          last_message: conv.last_message_content || "",
          timestamp: "",
        });
      });

      bookingsData.forEach((booking) => {
        const booker = booking.booked_by;

        if (!uniqueUsersMap.has(booker.id) && booker.id !== user.id) {
          uniqueUsersMap.set(booker.id, {
            id: booker.id,
            username: booker.username,
            profile_picture: booker.profile_picture,
            first_name: booker.first_name,
            last_name: booker.last_name,
          });
        }

        const provider = booking.booked_for;

        if (!uniqueUsersMap.has(provider.id) && provider.id !== user.id) {
          uniqueUsersMap.set(provider.id, {
            id: provider.id,
            username: provider.username,
            profile_picture: provider.profile_picture,
            first_name: provider.first_name,
            last_name: provider.last_name,
          });
        }
      });

      if (userIdParam) {
        const userIdFromUrl = parseInt(userIdParam, 10);

        if (
          !isNaN(userIdFromUrl) &&
          userIdFromUrl !== user.id &&
          !uniqueUsersMap.has(userIdFromUrl)
        ) {
          try {
            const userFromUrl = await fetchPublicUser(userIdFromUrl);
            console.log(`Fetched user ${userIdFromUrl} from URL:`, userFromUrl);

            uniqueUsersMap.set(userFromUrl.id, {
              id: userFromUrl.id,
              username: userFromUrl.username,
              profile_picture: userFromUrl.profile_picture,
              first_name: userFromUrl.first_name,
              last_name: userFromUrl.last_name,
            });

            setSelectedUserId(userFromUrl.id);
          } catch (userFetchError) {
            console.error(
              `Error fetching user ${userIdFromUrl} from URL:`,
              userFetchError
            );

            toast.error(`Could not load chat for user ID ${userIdFromUrl}.`);
            setSelectedUserId(null);
          }
        } else if (userIdFromUrl === user.id) {
          setSelectedUserId(null);
        } else if (!isNaN(userIdFromUrl) && uniqueUsersMap.has(userIdFromUrl)) {
          setSelectedUserId(userIdFromUrl);
        } else if (isNaN(userIdFromUrl)) {
          setSelectedUserId(null);
          console.warn(`Invalid user ID in URL: ${userIdParam}`);
        }
      }

      const mergedChatUsers = Array.from(uniqueUsersMap.values());

      mergedChatUsers.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
        if (a.timestamp) return -1;
        if (b.timestamp) return 1;

        return a.username.localeCompare(b.username);
      });

      console.log("Merged chat users:", mergedChatUsers);
      setChatUsers(mergedChatUsers);
    } catch (err: any) {
      console.error("Error fetching chat data:", err);
      setListError(err.message || "Failed to load chats.");
      setChatUsers([]);

      setSelectedUserId(null);
    } finally {
      setIsListLoading(false);
    }
  }, [user?.id, accessToken, userIdParam]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showChatOnly = isMobile && selectedUserId !== null;
  const showListOnly = isMobile && selectedUserId === null;

  return (
    <div className="flex max-h-full flex-grow antialiased text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
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
            conversations={chatUsers}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            isLoading={isListLoading}
            error={listError}
            onRetry={fetchChatData}
          />
        </div>

        <div
          className={`flex-1 flex flex-col ${
            showListOnly ? "hidden" : ""
          } sm:block bg-background dark:bg-background-dark transition-all duration-300 ease-in-out`}
        >
          {selectedUserId !== null ? (
            <PrivateChat
              other_user_id={selectedUserId}
              onBackToList={handleBackToList}
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
