import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import LeaderboardList from "../components/leaderboard/LeaderboardList";
import { useAuthStore } from "../store/authStore";
import {
  fetchGlobalLeaderboard,
  fetchUserGlobalStats,
} from "../services/leaderboard";
import { LeaderboardEntry, GlobalLeaderboardSortBy } from "../store/types";
import { Select, SelectItem } from "../components/ui/Select";
import {
  ListOrderedIcon,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Clock,
  Users,
} from "lucide-react";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [currentUserData, setCurrentUserData] =
    useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<GlobalLeaderboardSortBy>("given");

  const { user: currentUser } = useAuthStore();

  const location = useLocation();

  const widthClass = location.pathname.includes("/dashboard")
    ? "lg:min-w-xl lg:px -20 mx- auto"
    : "lg:min-w-xl mx-auto flex-1";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchGlobalLeaderboard(page, pageSize, sortBy);

        setLeaderboard(data.results);
        setNext(data.next);
        setPrevious(data.previous);

        if (currentUser) {
          try {
            const userData = await fetchUserGlobalStats(currentUser.id);
            setCurrentUserData(userData);
          } catch (userStatsError) {
            console.error(
              "Failed to fetch current user stats:",
              userStatsError
            );

            setCurrentUserData(null);
          }
        } else {
          setCurrentUserData(null);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [page, pageSize, sortBy, currentUser]);

  const handlePreviousPage = () => {
    if (previous) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (next) {
      setPage(page + 1);
    }
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value as GlobalLeaderboardSortBy);
    setPage(1);
  };

  return (
    <div
      className={`flex items-center justify-center ${widthClass}
                   bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark`}
    >
      <div
        className={`rounded-lg flex-grow shadow-md p-4 md:p-6
                     bg-card text-card-foreground border border-border
                     dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark`}
      >
        <h1 className="text-4xl text-center mb-10 mt-5 text-foreground dark:text-foreground-dark">
          Global Leaderboard
        </h1>

        {currentUser && (
          <div
            className="rounded-lg p-3 mb-4
                         bg-secondary text-secondary-foreground border border-border
                         dark:bg-secondary-dark dark:text-secondary-foreground-dark dark:border-border-dark"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-2 md:mb-0">
                <div
                  className="rounded-full p-1.5 mr-2
                             bg-muted dark:bg-muted-dark"
                >
                  <Avatar
                    src={currentUser.profile_picture || undefined}
                    fallback={
                      currentUser.username
                        ? currentUser.username[0].toUpperCase()
                        : "U"
                    }
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground dark:text-foreground-dark">
                    Your Global Stats
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                    {currentUserData ? (
                      <>
                        You have contributed{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          {currentUserData.total_hours_given}
                        </span>{" "}
                        hours, received{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          {currentUserData.total_hours_received}
                        </span>{" "}
                        hours, completed{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          {currentUserData.sessions_completed}
                        </span>{" "}
                        sessions, with a net contribution of{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          {currentUserData.net_contribution}
                        </span>{" "}
                        hours.
                      </>
                    ) : (
                      "Complete sessions to appear on the leaderboard!"
                    )}
                  </p>
                </div>
              </div>

              <Link to="/dashboard/settings">
                <Button variant="link" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-foreground dark:text-foreground-dark">
            Leaderboard
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Select
              value={sortBy}
              onValueChange={handleSortByChange}
              placeholder="Sort By"
              className="w-full md:w-auto lg:w-50"
              icon={<ListOrderedIcon className="h-4 w-4" />}
            >
              <SelectItem value="given" className="flex">
                <ArrowUpWideNarrow className="h-4 w-4 mr-2" /> Hours Given
              </SelectItem>
              <SelectItem value="received" className="flex">
                <ArrowDownWideNarrow className="h-4 w-4 mr-2" /> Hours Received
              </SelectItem>
              <SelectItem value="sessions" className="flex">
                <Clock className="h-4 w-4 mr-2" /> Sessions Completed
              </SelectItem>
              <SelectItem value="net" className="flex">
                <Users className="h-4 w-4 mr-2" /> Net Contribution
              </SelectItem>
            </Select>
            <div className="flex space-x-2">
              <Button
                onClick={handlePreviousPage}
                disabled={!previous || isLoading}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={!next || isLoading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary dark:border-primary-dark"></div>
          </div>
        ) : error ? (
          <div className="text-center text-danger dark:text-danger-dark">
            {error}
          </div>
        ) : leaderboard.length > 0 ? (
          <LeaderboardList rankedUsers={leaderboard} page={page} />
        ) : (
          <div className="text-center text-muted-foreground dark:text-muted-foreground-dark">
            No leaderboard data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
