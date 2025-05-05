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
        className="object-cover w-full h-full"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    ) : (
      <div className="flex items-center justify-center h-full w-full bg-blue-200 text-sm font-semibold text-blue-800">
        {userData.first_name?.charAt(0) || userData.username?.charAt(0) || "U"}
      </div>
    );
  };

  return (
    <button
      className={`flex items-center p-4 gap-3 w-full text-left border-b border-gray-200 transition duration-150 ease-in-out
                 ${
                   isSelected
                     ? "bg-blue-100 hover:bg-blue-200"
                     : "bg-white hover:bg-gray-100"
                 }`}
      onClick={() => onSelect(user.id)}
    >
      <div className="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12 border border-gray-300">
        {getUserAvatar(user)}
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-gray-800 truncate">
          {user.first_name || user.username || "Unknown User"}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          Last message preview...
        </p>
      </div>
    </button>
  );
}
