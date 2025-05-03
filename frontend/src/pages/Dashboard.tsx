import { Clock, Calendar, BookOpen, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../components/ui/Badge";
import { useAuthStore } from "../store/authStore";
import {
  mockLeaderboard,
  mockSessions,
  mockSkills,
  mockTransactions,
} from "../store/types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const topEntries = mockLeaderboard.sort().slice(0, 5);

  if (!user) return null;

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

  const upcomingSessions = mockSessions
    .filter(
      (booking) =>
        booking.status === "Confirmed" &&
        new Date(booking.scheduled_time) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_time).getTime() -
        new Date(b.scheduled_time).getTime()
    )
    .slice(0, 3);

  const recentTransactions = [...mockTransactions]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 h-full w-full selection:bg-border">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 bg-white rounded-lg shadow-full p-6">
          <div className="flex flex-row items-center gap-4 mb-4">
            <div className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16 border border-gray-300">
              <img
                src={user.profile_picture || ""}
                alt={user.first_name}
                className="object-cover w-full h-full"
              />
              {!user.profile_picture && (
                <div className="flex items-center justify-center h-full w-full bg-gray-200 text-lg font-semibold text-gray-700">
                  {user.first_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.first_name}
              </h2>
              <p className="text-gray-600">@{user.username}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {mockSkills
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
                {mockSkills.filter((skill) => skill.is_offered).length > 2 && (
                  <Badge variant="ghost" className="bg-blue-100">
                    +{mockSkills.filter((skill) => skill.is_offered).length - 2}{" "}
                    more
                  </Badge>
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
                    {user.id} ID
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Skills</span>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {mockSkills.filter((skill) => skill.is_offered).length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Sessions</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {
                      mockSessions.filter(
                        (booking) => booking.status === "Completed"
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Rank</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {mockLeaderboard.findIndex(
                      (entry) => entry.user.id === user.id
                    ) + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-full p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Upcoming Sessions
            </h3>
            <p className="text-gray-600 mt-1">
              Your scheduled skill exchange sessions
            </p>
          </div>
          <div>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {session.requester.id === user.id ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {session.skill.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {session.requester.id === user.id
                              ? `Learning from ${session.provider.first_name}`
                              : `Teaching ${session.requester.first_name}`}
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
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-600">
                <p className="text-sm">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-full p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Transactions
            </h3>
            <p className="text-gray-600 mt-1">Your time credit activity</p>
          </div>
          <div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start gap-4">
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
                    {/* <p className="text-xs text-gray-600">
                      {formatDistanceToNow (new Date(transaction.timestamp), { addSuffix: true })}
                    </p> */}
                    <p className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(transaction.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="space-y-4">
            {topEntries.length > 0 ? (
              topEntries.map((entry, index) =>
                entry && entry.user ? (
                  <div
                    key={entry.id || `entry-${index}`}
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
                          {typeof entry.score === "number"
                            ? entry.score.toFixed(2)
                            : entry.score}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={`empty-${index}`} className="text-sm text-gray-500">
                    Invalid entry data
                  </div>
                )
              )
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No leaderboard data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
