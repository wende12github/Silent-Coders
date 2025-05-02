import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import LeaderboardList from "../components/leaderboard/LeaderboardList";
import { useAuthStore } from "../store/authStore";
import { allUsers as mockUsers, LeaderboardEntry, User } from "../store/types";

type TimePeriod = "all-time" | "month";

export const processAndRankLeaderboard = (
  users: User[],
  entries: LeaderboardEntry[],
  timePeriod: TimePeriod
): LeaderboardEntry[] => {
  let filteredAndAggregatedEntries: {
    [userId: number]: { score: number; latestEntry?: LeaderboardEntry };
  } = {};

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  entries.forEach((entry) => {
    const score =
      typeof entry.score === "number" ? entry.score : parseFloat(entry.score);
    if (isNaN(score)) return;

    let includeEntry = false;
    if (timePeriod === "month") {
      const entryDate = new Date(entry.timestamp);
      includeEntry =
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear;
    } else {
      includeEntry = true;
    }

    if (includeEntry) {
      if (!filteredAndAggregatedEntries[entry.user.id]) {
        filteredAndAggregatedEntries[entry.user.id] = {
          score: 0,
          latestEntry: entry,
        };
      }
      filteredAndAggregatedEntries[entry.user.id].score += score;
      filteredAndAggregatedEntries[entry.user.id].latestEntry = entry;
    }
  });

  const rankedUsers: LeaderboardEntry[] = Object.keys(
    filteredAndAggregatedEntries
  )
    .map((userId) => {
      const userIdNum = parseInt(userId, 10);
      const aggregatedData = filteredAndAggregatedEntries[userIdNum];
      const user = users.find((u) => u.id === userIdNum);

      return {
        id: aggregatedData.latestEntry?.id || userIdNum,
        user_id: userIdNum,
        week: aggregatedData.latestEntry?.week || 0,
        timestamp:
          aggregatedData.latestEntry?.timestamp || new Date(0).toISOString(),
        score: aggregatedData.score,
        user: user || {
          id: userIdNum,
          username: "Unknown",
          email: "",
          bio: null,
          profile_picture: null,
          time_wallet: 0,
          is_active: false,
          is_admin: false,
          date_joined: "",
          name: "Unknown",
          completed_sessions: 0,
        },
      };
    })
    .sort((a, b) => b.score - a.score);

  return rankedUsers;
};

const LeaderboardPage = () => {
  const { leaderboard } = useAuthStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all-time");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { user: currentUser } = useAuthStore();

  // Load mock data
  useEffect(() => {
    const loadMockData = async () => {
      setIsDataLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAllUsers(mockUsers);
      setAllEntries(leaderboard);
      setIsDataLoading(false);
    };

    loadMockData();
  }, []);

  // Process and rank data
  const rankedUsers = useMemo(() => {
    if (isDataLoading || allUsers.length === 0 || allEntries.length === 0) {
      return [];
    }
    return processAndRankLeaderboard(allUsers, allEntries, timePeriod);
  }, [allUsers, allEntries, timePeriod, isDataLoading]);

  // Calculate current user rank and points
  const { currentUserRank, currentUserPoints } = useMemo(() => {
    let rank: number | null = null;
    let points: number | string = currentUser?.time_wallet || 0.0;
    const currentUserId = currentUser?.id;

    if (currentUserId !== null && rankedUsers.length > 0) {
      const currentUserIndex = rankedUsers.findIndex(
        (entry) => entry.user?.id === currentUserId
      );

      if (currentUserIndex >= 0) {
        rank = currentUserIndex + 1;
        points = rankedUsers[currentUserIndex].score;
      } else {
        rank = null;
      }
    } else if (currentUser !== null) {
      points = currentUser.time_wallet;
      rank = null;
    } else {
      points = "0.00";
      rank = null;
    }

    return {
      currentUserRank: rank,
      currentUserPoints:
        typeof points === "number" ? points.toFixed(2) : points,
    };
  }, [rankedUsers, currentUser]);

  // Use useLocation for conditional width class in react-router-dom
  const location = useLocation();
  const widthClass = location.pathname.includes("/dashboard")
    ? "w-full lg:px-20"
    : "max-w-7xl mx-auto";

  return (
    <div className={`rounded-lg shadow-md p-4 md:p-6 ${widthClass}`}>
      <h1 className="text-4xl text-center mb-10 mt-5">Leaderboard</h1>

      {/* Current User Stats Banner */}
      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-1 md:mb-0">
              <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                {/* Use currentUser from store for the Avatar */}
                <Avatar
                  src={currentUser.profile_picture}
                  fallback={currentUser.username || "U"}
                />
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  Your Stats
                </h3>
                <p className="text-xs text-gray-500">
                  {currentUserRank ? (
                    <>
                      Ranked{" "}
                      <span className="font-bold">#{currentUserRank}</span> with{" "}
                    </>
                  ) : (
                    `You're not ranked this ${
                      timePeriod === "month" ? "month" : "period"
                    }. Earn `
                  )}
                  <span className="font-bold">{currentUserPoints} credits</span>
                </p>
              </div>
            </div>
            {/* Use react-router-dom Link */}
            <Link to={`/dashboard/settings`}>
              {/* Button component wrapped by Link */}
              <Button variant="link" size="sm">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Time Period Toggle and Title */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h1 className="text-xl font-bold mb-2 md:mb-0">Top Contributors</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setTimePeriod("all-time")}
            variant={timePeriod === "all-time" ? "default" : "outline"}
            className="border"
            disabled={isDataLoading}
          >
            All-Time
          </Button>
          <Button
            onClick={() => setTimePeriod("month")}
            variant={timePeriod === "month" ? "default" : "outline"}
            className="border"
            disabled={isDataLoading}
          >
            This Month
          </Button>
        </div>
      </div>

      {/* Main Loading State */}
      {isDataLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <LeaderboardList rankedUsers={rankedUsers} />
      )}
    </div>
  );
};

export default LeaderboardPage;
