import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import LeaderboardList from "../components/leaderboard/LeaderboardList";
import { useAuthStore } from "../store/authStore";
import {
  fetchLeaderboard,
  fetchUserLeaderboard,
} from "../services/leaderboard";
import { LeaderboardEntry } from "../store/types";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserData, setCurrentUserData] =
    useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const { user: currentUser } = useAuthStore();
  const location = useLocation();
  const widthClass = location.pathname.includes("/dashboard")
    ? "lg:min-w-7xl lg:px-20 mx-auto"
    : "lg:min-w-7xl mx-auto flex-1";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeaderboard(page, limit);
        const filteredResults = data.results.filter(
          (entry) => Object.keys(entry).length > 0
        );

        setLeaderboard(filteredResults);
        setCount(data.count);
        setNext(data.next);
        setPrevious(data.previous);

        if (currentUser) {
          const userData = await fetchUserLeaderboard(currentUser.id);
          setCurrentUserData(userData);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [page, currentUser]);

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
          Leaderboard
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
                    src={currentUser.profile_picture}
                    fallback={currentUser.username || "U"}
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground dark:text-foreground-dark">
                    Your Stats
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                    {currentUserData ? (
                      <>
                        You are ranked{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          #{currentUserData.sessions_completed}
                        </span>{" "}
                        with{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          {currentUserData.net_contribution}
                        </span>{" "}
                        points and{" "}
                        <span className="font-bold text-primary dark:text-primary-dark">
                          {currentUserData.sessions_completed}
                        </span>{" "}
                        sessions.
                      </>
                    ) : (
                      "You're not ranked yet. Complete sessions to appear!"
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground dark:text-foreground-dark">
            Top Contributors
          </h2>
          <div className="space-x-2">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!previous || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={!next || isLoading}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-48 w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary dark:border-primary-dark"></div>
          </div>
        ) : (
          <LeaderboardList rankedUsers={leaderboard} />
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
