import { Clock, Calendar, BookOpen, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../components/ui/Badge";
import { useAuthStore } from "../store/authStore";
import { Booking, Skill, LeaderboardEntry } from "../store/types";
import { fetchMyBookings } from "../services/booking";
import { fetchMySkills } from "../services/skill";
import { fetchLeaderboard } from "../services/leaderboard";
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

  const [bookings, setBookings] = useState<Booking<Skill>[] | null>(null);
  const [mySkills, setMySkills] = useState<Skill[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<
    LeaderboardEntry[] | null
  >(null);

  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);

  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [errorSkills, setErrorSkills] = useState<string | null>(null);

  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);

  if (!user) {
    return null;
  }

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
        setMySkills(data);
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
        const data = await fetchLeaderboard();
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
    console.log(dateString);
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    console.log(dateString);
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
    console.log("Transactions Type:", typeof transactions);
    console.log("Transactions:", transactions);
  const recentTransactions = (transactions || [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const topEntries = (leaderboardData || [])
    .sort(
      (a, b) => parseFloat(b.net_contribution) - parseFloat(a.net_contribution)
    )
    .slice(0, 5);

  const renderContent = (
    isLoading: boolean,
    error: string | null,
    data: any[] | number | null,
    renderData: (data: any[] | number) => React.ReactNode,
    emptyMessage: string
  ) => {
    if (isLoading) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-4 text-red-500 text-sm">
          Error: {error}
        </div>
      );
    }

    if (typeof data === "number") {
      return renderData(data);
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          {emptyMessage}
        </div>
      );
    }
    return renderData(data);
  };

  return (
    <div className="p-6 space-y-6 h-full w-full selection:bg-border">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 bg-white rounded-lg shadow-full p-6">
          <div className="flex flex-row items-center gap-4 mb-4">
            <div className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16 border border-gray-300">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.first_name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200 text-lg font-semibold text-gray-700">
                  {user.first_name?.charAt(0) ||
                    user.username?.charAt(0) ||
                    "U"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.first_name}
              </h2>
              <p className="text-gray-600">@{user.username}</p>
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
                            <Badge
                              variant="info"
                              key={skill.id}
                              className="bg-blue-100! text-blue-600!"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                      {Array.isArray(skills) &&
                        skills.filter((skill) => skill.is_offered).length >
                          2 && (
                          <Badge variant="ghost" className="bg-blue-100">
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
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Time Balance</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
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
                <span className="text-sm text-gray-600">Skills</span>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
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
                <span className="text-sm text-gray-600">Sessions</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
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
                <span className="text-sm text-gray-600">Rank</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  {renderContent(
                    isLoadingLeaderboard,
                    errorLeaderboard,
                    leaderboardData,
                    (leaderboard) => {
                      if (Array.isArray(leaderboard)) {
                        const userRankEntry = leaderboard.find(
                          (entry) => entry.user.id === user.id
                        );
                        return (
                          <span className="text-2xl font-bold text-gray-900">
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
        {" "}
        <div className="md:col-span-1 bg-white rounded-lg shadow-full p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Upcoming Sessions
            </h3>
            <p className="text-gray-600 mt-1">
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
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          {session.booked_by === user.username ? (
                            <BookOpen className="h-5 w-5" />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {session.skill?.name || "Skill Name"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {session.booked_by === user.username
                                  ? `Learning from ${
                                      session.booked_for_user?.first_name ||
                                      session.booked_for
                                    }`
                                  : `Teaching ${
                                      session.booked_by_user?.first_name ||
                                      session.booked_by
                                    }`}{" "}
                              </p>
                            </div>
                            <div className="mt-2 sm:mt-0 sm:text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(session.scheduled_time)}
                              </p>
                              <p className="text-sm text-gray-600">
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
        <div className="md:col-span-1 bg-white rounded-lg shadow-full p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Transactions
            </h3>
            <p className="text-gray-600 mt-1">Your time credit activity</p>
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
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.reason}
                            </p>
                            <p
                              className={`text-sm font-medium ${
                                transaction.amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600">
                          <>{()=> console.log("Timestamp: ", transaction.timestamp)}</>
                            {transaction.timestamp && formatDistanceToNow(
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

      <div className="bg-white rounded-lg shadow-full p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Weekly Leaderboard
          </h3>
          <p className="text-gray-600 mt-1">Top 5 contributors this week</p>
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                          {index + 1}
                        </div>

                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-gray-300">
                            {entry.user.profile_picture ? (
                              <img
                                src={entry.user.profile_picture}
                                alt={entry.user.first_name || "User"}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-gray-200 text-sm font-semibold text-gray-700">
                                {entry.user.first_name?.charAt(0) ||
                                  entry.user.username?.charAt(0) ||
                                  "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.user.first_name || entry.user.username}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              @{entry.user.username}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              {entry.net_contribution}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={`empty-${index}`}
                        className="text-sm text-gray-500"
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
