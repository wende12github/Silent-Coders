import React from "react";
import { Trophy } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import { LeaderboardEntry } from "../../store/types";

interface LeaderboardSectionProps {
  leaderboard: LeaderboardEntry[] | null;
  isLoading: boolean;
  error: string | null;
}

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  leaderboard,
  isLoading,
  error,
}) => {
  const renderContent = (
    isLoading: boolean,
    error: string | null,
    data: any[] | null,
    renderData: (data: any[]) => React.ReactNode,
    emptyMessage: string
  ) => {
    if (isLoading) {
      return (
        <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark text-sm">
          Loading...
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-4 text-destructive dark:text-destructive-dark text-sm">
          Error: {error}
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark text-sm">
          {emptyMessage}
        </div>
      );
    }
    return renderData(data);
  };

  return (
    <div className="overflow-x-auto rounded-md border border-border dark:border-border-dark">
      {renderContent(
        isLoading,
        error,
        leaderboard,
        (leaderboardData) => (
          <table
            className="min-w-full rounded-md shadow-sm overflow-hidden
                           bg-card text-card-foreground"
          >
            <thead className="bg-muted dark:bg-muted-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                  Time Credits
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(leaderboardData) &&
                leaderboardData.map((entry: LeaderboardEntry, index) => (
                  <tr
                    key={entry.user.id}
                    className="border-t border-border dark:border-border-dark hover:bg-muted/50 dark:hover:bg-muted-dark/50"
                  >
                    <td className="px-6 py-4 text-sm text-foreground dark:text-foreground-dark whitespace-nowrap">
                      {index === 0 ? (
                        <span className="inline-flex items-center font-semibold text-primary dark:text-primary-dark">
                          <Trophy className="h-5 w-5 mr-1" /> 1
                        </span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                      <Avatar
                        fallback={
                          entry.user.first_name?.charAt(0) ||
                          entry.user.username?.charAt(0) ||
                          "U"
                        }
                        src={entry.user.profile_picture}
                        alt={entry.user.first_name || entry.user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-foreground dark:text-foreground-dark">
                        {entry.user.first_name || entry.user.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      {entry.net_contribution} credits
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ),
        "No leaderboard data available for this group."
      )}
    </div>
  );
};

export default LeaderboardSection;
