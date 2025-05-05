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
  const [currentUserData, setCurrentUserData] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;
  const [count, setCount] = useState(0);
const [next, setNext] = useState<string | null>(null);
const [previous, setPrevious] = useState<string | null>(null);

  const { user: currentUser } = useAuthStore();
  const location = useLocation();
  const widthClass = location.pathname.includes("/dashboard")
    ? "w-full lg:px-20"
    : "max-w-7xl mx-auto";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeaderboard(page, limit);
        const filteredResults = data.results.filter(entry => Object.keys(entry).length > 0);
  

       
        setLeaderboard(filteredResults);
        setCount(data.count);
        setNext(data.next);
        setPrevious(data.previous);
        // setLeaderboard(data);
        // setHasMore(data.length === limit); // if fewer results, no more pages
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
    <div className={`rounded-lg shadow-md p-4 md:p-6 ${widthClass}`}>
      <h1 className="text-4xl text-center mb-10 mt-5">Leaderboard</h1>

      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                <Avatar
                  src={currentUser.profile_picture}
                  fallback={currentUser.username || "U"}
                />
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">Your Stats</h3>
                <p className="text-xs text-gray-500">
                  {currentUserData ? (
                    <>
                      You are ranked{" "}
                      <span className="font-bold">#{currentUserData.sessions_completed}</span> with{" "}
                      <span className="font-bold">{currentUserData.net_contribution}</span> points and{" "}
                      <span className="font-bold">{currentUserData.sessions_completed}</span> sessions.
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
        <h2 className="text-xl font-bold">Top Contributors</h2>
        <div className="space-x-2">
          <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={!previous || isLoading}>
            Previous
          </Button>
          <Button onClick={() => setPage((p) => p + 1)} disabled={!next || isLoading}>
            Next
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <LeaderboardList rankedUsers={leaderboard} />
      )}
    </div>
  );
};

export default LeaderboardPage;
