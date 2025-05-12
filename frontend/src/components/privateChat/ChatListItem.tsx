import { ChatUser } from "../../store/types";

interface ChatListItemProps {
  chatUser: ChatUser;
  isSelected: boolean;
  onSelect: (userId: number) => void;
}

export default function ChatListItem({
  chatUser,
  isSelected,
  onSelect,
}: ChatListItemProps) {
  const user = chatUser;

  const { last_message, timestamp, unread_count } = chatUser;
  console.log(chatUser);

  const getUserAvatar = (userData: ChatUser) => {
    return userData.profile_picture ? (
      <img
        src={userData.profile_picture}
        alt={userData.first_name || userData.username || "User"}
        className="object-cover w-full h-full rounded-full"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    ) : (
      <div className="flex items-center justify-center h-full w-full bg-primary/20 text-sm font-semibold text-primary dark:bg-primary-dark/20 dark:text-primary-dark rounded-full">
        {userData.first_name?.charAt(0) || userData.username?.charAt(0) || "U"}
      </div>
    );
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return "";

    try {
      const date = new Date(isoString);

      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch (e) {
      console.error("Invalid timestamp format:", isoString);
      return "";
    }
  };

  return (
    <button
      className={`flex items-center p-4 gap-3 w-full text-left border-b border-border dark:border-border-dark transition duration-150 ease-in-out
      ${
        isSelected
          ? "bg-primary/10 hover:bg-primary/20 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/20"
          : "bg-card hover:bg-muted dark:bg-card-dark dark:hover:bg-muted-dark"
      }`}
      onClick={() => onSelect(user.id)}
    >
      <div className="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12 border border-border dark:border-border-dark">
        {getUserAvatar(user)}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground dark:text-foreground-dark truncate">
            {user.first_name || user.username || "Unknown User"}
          </h3>

          {unread_count !== undefined && unread_count > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-bold text-primary-foreground dark:text-primary-foreground-dark bg-primary dark:bg-primary-dark rounded-full">
              {unread_count}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark truncate">
          {last_message || "No messages yet"}

          {timestamp && <small> - {formatTimestamp(timestamp)}</small>}
        </p>
      </div>
    </button>
  );
}
