import { User } from "../../store/types";

interface ChatListItemProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: number) => void;
}

export default function ChatListItem({
  user,
  isSelected,
  onSelect,
}: ChatListItemProps) {
  const getUserAvatar = (userData: User) => {
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
        <h3 className="font-semibold text-foreground dark:text-foreground-dark truncate">
          {user.first_name || user.username || "Unknown User"}
        </h3>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark truncate">
          Last message preview...
        </p>
      </div>
    </button>
  );
}
