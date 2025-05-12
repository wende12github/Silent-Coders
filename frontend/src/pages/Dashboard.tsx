import { Clock, Calendar, BookOpen, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../components/ui/Badge";
import { useAuthStore } from "../store/authStore";
import { Booking, Skill, LeaderboardEntry } from "../store/types";
import { fetchMyBookings } from "../services/booking";
import { fetchMySkills } from "../services/skill";
import { fetchGlobalLeaderboard } from "../services/leaderboard";
import { useEffect, useState } from "react";
import { useWallet } from "../hooks/useWallet";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const {
    balance,
    transactions,
    isLoading: isLoadingWallet,
    error: errorWallet,
  } = useWallet();

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [mySkills, setMySkills] = useState<Skill[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>();

  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);

  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [errorSkills, setErrorSkills] = useState<string | null>(null);

  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);


  useEffect(() => {
    const loadBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const data = await fetchMyBookings();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setErrorBookings("Failed to fetch bookings.");
      } finally {
        setIsLoadingBookings(false);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    const loadSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const data = await fetchMySkills();
        setMySkills(data.results);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setErrorSkills("Failed to fetch skills.");
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkills();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const data = await fetchGlobalLeaderboard();
        setLeaderboardData(data.results);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setErrorLeaderboard("Failed to fetch leaderboard.");
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    loadLeaderboard();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingSessions = (bookings || [])
    .filter((booking) => new Date(booking.scheduled_time) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.scheduled_time).getTime() -
        new Date(b.scheduled_time).getTime()
    )
    .slice(0, 3);

  const recentTransactions = (transactions || [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const topEntries = (leaderboardData || [])
    .sort(
      (a, b) => b.net_contribution - a.net_contribution
    )
    .slice(0, 5);

  const renderContent = (
    isLoading: boolean,
    error: string | null,
    data: any[] | number | null | undefined,
    renderData: (data: any[] | number) => React.ReactNode,
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

    if (typeof data === "number") {
      return renderData(data);
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
    <div
      className="p-6 space-y-6 h-full w-full
                   bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark"
    >
      <div className="flex flex-col gap-4 md:flex-row">
        <div
          className="flex-1 rounded-lg shadow-full p-6
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div className="flex flex-row items-center gap-4 mb-4">
            <div
              className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16 border
                           border-border dark:border-border-dark"
            >
              {user!.profile_picture ? (
                <img
                  src={user!.profile_picture}
                  alt={user!.first_name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className="flex items-center justify-center h-full w-full
                               bg-muted text-muted-foreground dark:bg-muted-dark dark:text-muted-foreground-dark text-lg font-semibold"
                >
                  {user!.first_name?.charAt(0) ||
                    user!.username?.charAt(0) ||
                    "U"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground dark:text-foreground-dark">
                {user!.first_name}
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">
                @{user!.username}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {renderContent(
                  isLoadingSkills,
                  errorSkills,
                  mySkills,
                  (skills) => (
                    <>
                      {Array.isArray(skills) &&
                        skills
                          .filter((skill) => skill.is_offered)
                          .slice(0, 2)
                          .map((skill) => (
                            <Badge variant="secondary" key={skill.id}>
                              {skill.name}
                            </Badge>
                          ))}
                      {Array.isArray(skills) &&
                        skills.filter((skill) => skill.is_offered).length >
                          2 && (
                          <Badge
                            variant="ghost"
                            className="bg-muted dark:bg-muted-dark"
                          >
                            +
                            {skills.filter((skill) => skill.is_offered).length -
                              2}{" "}
                            more
                          </Badge>
                        )}
                    </>
                  ),
                  "No skills offered"
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border dark:border-border-dark">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Time Balance
                </span>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary dark:text-primary-dark" />
                  <span className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                    {renderContent(
                      isLoadingWallet,
                      errorWallet,
                      balance,
                      (bal) => bal,
                      "-"
                    )}{" "}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Skills
                </span>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary dark:text-primary-dark" />
                  <span className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                    {renderContent(
                      isLoadingSkills,
                      errorSkills,
                      mySkills,
                      (skills) =>
                        Array.isArray(skills)
                          ? skills.filter((skill) => skill.is_offered).length
                          : "0",
                      "0"
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Sessions
                </span>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary dark:text-primary-dark" />
                  <span className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                    {renderContent(
                      isLoadingBookings,
                      errorBookings,
                      bookings,
                      (bks) =>
                        Array.isArray(bks)
                          ? bks.filter(
                              (booking) => booking.status === "completed"
                            ).length
                          : "0",
                      "0"
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Rank
                </span>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary dark:text-primary-dark" />
                  {renderContent(
                    isLoadingLeaderboard,
                    errorLeaderboard,
                    leaderboardData,
                    (leaderboard) => {
                      if (Array.isArray(leaderboard)) {
                        const userRankEntry = leaderboard.find(
                          (entry) => entry.user.id === user!.id
                        );
                        return (
                          <span className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                            {userRankEntry
                              ? leaderboard.indexOf(userRankEntry) + 1
                              : "-"}{" "}
                          </span>
                        );
                      }
                      return "-";
                    },
                    "-"
                  )}{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
        <div
          className="md:col-span-1 rounded-lg shadow-full p-6
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground dark:text-foreground-dark">
              Upcoming Sessions
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
              Your scheduled skill exchange sessions
            </p>
          </div>
          <div>
            {renderContent(
              isLoadingBookings,
              errorBookings,
              upcomingSessions,
              (sessions) => (
                <div className="space-y-4">
                  {Array.isArray(sessions) &&
                    sessions.filter(se => se.status !== "completed").map((session: Booking) => (
                      <div
                        key={session.id}
                        className="flex items-start gap-4 rounded-lg border p-4
                                   border-border dark:border-border-dark"
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full
                                       bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                        >
                          {session.booked_by.username === user!.username ? (
                            <BookOpen className="h-5 w-5" />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="font-medium text-foreground dark:text-foreground-dark">
                                {session.skill?.name || "Skill Name"}
                              </h4>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                                {session.booked_by.username === user!.username
                                  ? `Learning from ${
                                      session.booked_for.first_name
                                    }`
                                  : `Teaching ${
                                      session.booked_by.first_name
                                    }`}
                              </p>
                            </div>
                            <div className="mt-2 sm:mt-0 sm:text-right">
                              <p className="text-sm font-medium text-foreground dark:text-foreground-dark">
                                {formatDate(session.scheduled_time)}
                              </p>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                                {formatTime(session.scheduled_time)} •{" "}
                                {session.duration} min
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ),
              "No upcoming sessions"
            )}
          </div>
        </div>
        <div
          className="md:col-span-1 rounded-lg shadow-full p-6
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground dark:text-foreground-dark">
              Recent Transactions
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
              Your time credit activity
            </p>
          </div>
          <div>
            {renderContent(
              isLoadingWallet,
              errorWallet,
              recentTransactions,
              (transactions) => (
                <div className="space-y-4">
                  {Array.isArray(transactions) &&
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-start gap-4"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            transaction.amount > 0
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground dark:text-foreground-dark">
                              {transaction.reason}
                            </p>
                            <p
                              className={`text-sm font-medium ${
                                transaction.amount > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                            {transaction.timestamp &&
                              formatDistanceToNow(
                                new Date(transaction.timestamp),
                                {
                                  addSuffix: true,
                                }
                              )}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ),
              "No recent transactions"
            )}
          </div>
        </div>
      </div>

      <div
        className="rounded-lg shadow-full p-6
                     bg-card text-card-foreground border border-border
                     dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground dark:text-foreground-dark">
            Weekly Leaderboard
          </h3>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
            Top 5 contributors this week
          </p>
        </div>
        <div>
          {renderContent(
            isLoadingLeaderboard,
            errorLeaderboard,
            topEntries,
            (entries) => (
              <div className="space-y-4">
                {Array.isArray(entries) &&
                  entries.map((entry, index) =>
                    entry && entry.user ? (
                      <div
                        key={entry.user.id || `entry-${index}`}
                        className="flex items-center gap-4"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0
                                       bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                        >
                          {index + 1}
                        </div>

                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-border dark:border-border-dark">
                            {entry.user.profile_picture ? (
                              <img
                                src={entry.user.profile_picture}
                                alt={entry.user.first_name || "User"}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div
                                className="flex items-center justify-center h-full w-full
                                             bg-muted text-muted-foreground dark:bg-muted-dark dark:text-muted-foreground-dark text-sm font-semibold"
                              >
                                {entry.user.first_name?.charAt(0) ||
                                  entry.user.username?.charAt(0) ||
                                  "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground dark:text-foreground-dark">
                              {entry.user.first_name || entry.user.username}
                            </p>
                            <p className="text-xs truncate text-muted-foreground dark:text-muted-foreground-dark">
                              @{entry.user.username}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                            <Clock className="h-4 w-4 text-primary dark:text-primary-dark" />
                            <span className="font-medium text-foreground dark:text-foreground-dark">
                              {entry.net_contribution}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={`empty-${index}`}
                        className="text-sm text-muted-foreground dark:text-muted-foreground-dark"
                      >
                        Invalid entry data
                      </div>
                    )
                  )}
              </div>
            ),
            "No leaderboard data available."
          )}
        </div>
      </div>
    </div>
  );
}
