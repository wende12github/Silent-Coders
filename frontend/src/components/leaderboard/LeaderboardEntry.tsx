import React from "react";
import { Link } from "react-router"; // Assuming Next.js Link
import Avatar from "../ui/Avatar"; // Adjust path
import { Badge } from "../ui/Badge";
import { LeaderboardEntry } from "../../store/types";
import { useAuthStore } from "../../store/authStore";

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  rank: number;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ entry, rank }) => {
  const { user } = useAuthStore();
  const expertScore = 50;
  const rankColorClass =
    rank === 1
      ? "bg-green-100 text-green-800"
      : rank === 2
      ? "bg-gray-100 text-gray-800"
      : rank === 3
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-50 text-gray-500";
  console.log(entry.net_contribution);

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg border ${
        entry.user.id === user?.id
          ? "border-blue-300 bg-blue-50 shadow-sm"
          : "border-gray-200 hover:bg-gray-50"
      } transition-colors`}
    >
      {/* Rank Indicator */}
      <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
        <div
          className={`flex items-center justify-center h-8 w-8 rounded-full ${rankColorClass}`}
        >
          <span className="text-sm font-bold">#{rank}</span>
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={
            entry.user.id === user?.id
              ? "/dashboard/settings"
              : `/profile/${entry.user.username}`
          }
          className="group"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Avatar
                src={entry.user.profile_picture}
                alt={entry.user.username}
                fallback={entry.user.username?.charAt(0) || "U"}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:underline underline-offset-2">
                  {entry.user.username}
                </p>
                {entry.user.id === user?.id && (
                  <Badge
                    size="lg"
                    variant="ghost"
                    className="bg-blue-100 text-blue-800"
                  >
                    You
                  </Badge>
                )}
              </div>
              {entry.user.bio && (
                <p className="text-xxs text-gray-500 truncate">
                  {entry.user.bio}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Credits and Badges */}
      <div className="mt-2 sm:mt-0 sm:ml-4 sm:text-right flex-shrink-0">
        {" "}
        {/* Added flex-shrink-0 */}
        <div className="text-lg font-bold text-gray-900">
          {parseFloat(entry.net_contribution)}{" "}
          <span className="text-xs font-normal text-gray-500">credits</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1 sm:justify-end">
          {rank === 1 && (
            <Badge
              size="lg"
              className="bg-yellow-100 text-yellow-800"
              variant="ghost"
            >
              Top
            </Badge>
          )}
          {parseFloat(entry.net_contribution) >= expertScore && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-green-100 text-green-800"
            >
              Exp
            </Badge>
          )}
          {parseFloat(entry.net_contribution) >= 50 && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-blue-100 text-blue-800"
            >
              Active
            </Badge>
          )}
          {entry.sessions_completed > 10 && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-purple-100 text-purple-800"
            >
              Sessions Champ
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardItem;
