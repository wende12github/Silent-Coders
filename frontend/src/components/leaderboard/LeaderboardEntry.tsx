import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
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
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : rank === 2
      ? "bg-muted text-muted-foreground dark:bg-muted-dark dark:text-muted-foreground-dark"
      : rank === 3
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      : "bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark";
  console.log(entry.net_contribution);

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg border transition-colors
                  ${
                    entry.user.id === user?.id
                      ? "border-primary bg-primary/10 shadow-sm dark:border-primary-dark dark:bg-primary-dark/10"
                      : "border-border hover:bg-muted/50 dark:border-border-dark dark:hover:bg-muted-dark/50"
                  }`}
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
                <p
                  className="text-sm font-medium truncate group-hover:underline underline-offset-2
                            text-foreground dark:text-foreground-dark"
                >
                  {entry.user.username}
                </p>
                {entry.user.id === user?.id && (
                  <Badge size="lg" variant="secondary">
                    You
                  </Badge>
                )}
              </div>
              {entry.user.bio && (
                <p
                  className="text-xxs truncate
                            text-muted-foreground dark:text-muted-foreground-dark"
                >
                  {entry.user.bio}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Credits and Badges */}
      <div className="mt-2 sm:mt-0 sm:ml-4 sm:text-right flex-shrink-0">
        <div className="text-lg font-bold text-foreground dark:text-foreground-dark">
          {parseFloat(entry.net_contribution).toFixed(2)}{" "}
          {/* Formatted to 2 decimal places */}
          <span className="text-xs font-normal text-muted-foreground dark:text-muted-foreground-dark">
            credits
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1 sm:justify-end">
          {rank === 1 && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Top
            </Badge>
          )}
          {parseFloat(entry.net_contribution) >= expertScore && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            >
              Exp
            </Badge>
          )}
          {parseFloat(entry.net_contribution) >= 50 && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              Active
            </Badge>
          )}
          {entry.sessions_completed > 10 && (
            <Badge
              size="lg"
              variant="ghost"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
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
