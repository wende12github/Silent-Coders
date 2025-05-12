import React from "react";
import LeaderboardItem from "./LeaderboardEntry";
import { LeaderboardEntry } from "../../store/types";

interface LeaderboardListProps {
  rankedUsers: LeaderboardEntry[] | null;
  page: number;
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({
  rankedUsers: leaderboardEntries,
  page,
}) => {
  if (!leaderboardEntries) return null;

  if (leaderboardEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          No data available for the selected time period
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaderboardEntries.map((entry, index) => (
        <LeaderboardItem
          key={entry.user.username}
          entry={entry}
          rank={page === 1 ? index + 1 : index + 1 + (page - 1) * 10}
        />
      ))}
    </div>
  );
};

export default LeaderboardList;
