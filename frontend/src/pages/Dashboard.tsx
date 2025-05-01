import { Clock, Calendar, BookOpen, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profile_picture?: string;
  time_wallet: number;
}

interface Skill {
  id: string;
  name: string;
  is_offered: boolean;
}

interface Booking {
  id: string;
  skill: Skill;
  requester: User;
  provider: User;
  scheduled_time: string;
  duration: number; // in minutes
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

interface LeaderboardEntry {
  id: string;
  user: User;
  score: number; // Example score, e.g., total time contributed
}

const useAuth = () => {
  // Mock user data
  const user: User = {
    id: "user-123",
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    time_wallet: 120,
    profile_picture: "https://placehold.co/100x100/4f46e5/ffffff?text=JD",
  };

  // Mock skills data
  const skills: Skill[] = [
    { id: "skill-1", name: "Web Development", is_offered: true },
    { id: "skill-2", name: "Graphic Design", is_offered: true },
    { id: "skill-3", name: "Spanish Tutoring", is_offered: false },
    { id: "skill-4", name: "Photography", is_offered: true },
  ];

  // Mock bookings data
  const bookings: Booking[] = [
    {
      id: "booking-1",
      skill: { id: "skill-1", name: "Web Development", is_offered: true },
      requester: user, // John is the requester
      provider: {
        id: "user-456",
        name: "Jane Smith",
        username: "janesmith",
        email: "jane.smith@example.com",
        time_wallet: 200,
      },
      scheduled_time: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 2
      ).toISOString(), // 2 days from now
      duration: 60,
      status: "Confirmed",
    },
    {
      id: "booking-2",
      skill: { id: "skill-2", name: "Graphic Design", is_offered: true },
      requester: {
        id: "user-789",
        name: "Peter Jones",
        username: "peterj",
        email: "peter.jones@example.com",
        time_wallet: 50,
      },
      provider: user, // John is the provider
      scheduled_time: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
      duration: 30,
      status: "Confirmed",
    },
    {
      id: "booking-3",
      skill: { id: "skill-3", name: "Spanish Tutoring", is_offered: false },
      requester: user, // John is the requester
      provider: {
        id: "user-101",
        name: "Maria Garcia",
        username: "mariag",
        email: "maria.garcia@example.com",
        time_wallet: 150,
      },
      scheduled_time: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 7
      ).toISOString(), // 7 days ago
      duration: 45,
      status: "Completed",
    },
  ];

  // Mock transactions data
  const transactions: Transaction[] = [
    {
      id: "txn-1",
      amount: -30,
      reason: "Session with Jane Smith (Web Dev)",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    }, // 2 hours ago
    {
      id: "txn-2",
      amount: 45,
      reason: "Session with Maria Garcia (Spanish)",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    }, // 6 days ago
    {
      id: "txn-3",
      amount: 50,
      reason: "Contribution Bonus",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    }, // 10 days ago
  ];

  // Mock leaderboard data
  const leaderboard: LeaderboardEntry[] = [
    {
      id: "lb-1",
      user: {
        id: "user-456",
        name: "Jane Smith",
        username: "janesmith",
        email: "jane.smith@example.com",
        time_wallet: 200,
      },
      score: 500,
    },
    {
      id: "lb-2",
      user: {
        id: "user-789",
        name: "Peter Jones",
        username: "peterj",
        email: "peter.jones@example.com",
        time_wallet: 50,
      },
      score: 300,
    },
    { id: "lb-3", user: user, score: 250 }, // John Doe's rank
    {
      id: "lb-4",
      user: {
        id: "user-101",
        name: "Maria Garcia",
        username: "mariag",
        email: "maria.garcia@example.com",
        time_wallet: 150,
      },
      score: 200,
    },
    {
      id: "lb-5",
      user: {
        id: "user-202",
        name: "David Lee",
        username: "davidl",
        email: "david.lee@example.com",
        time_wallet: 80,
      },
      score: 150,
    },
  ];

  return { user, skills, bookings, transactions, leaderboard };
};

export default function DashboardPage() {
  const { user, skills, bookings, transactions, leaderboard } = useAuth();

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

  const upcomingSessions = bookings
    .filter((booking) => booking.status === "Confirmed" && new Date(booking.scheduled_time) > new Date())
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
    .slice(0, 3);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6  min-h-screen w-full">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center gap-4 mb-4">
            <div className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16 border border-gray-300">
              <img src={user.profile_picture || ""} alt={user.name} className="object-cover w-full h-full" />
               {!user.profile_picture && (
                   <div className="flex items-center justify-center h-full w-full bg-gray-200 text-lg font-semibold text-gray-700">
                       {user.name.charAt(0)}
                   </div>
               )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">@{user.username}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills
                  .filter((skill) => skill.is_offered)
                  .slice(0, 2)
                  .map((skill) => (
                    <span key={skill.id} className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {skill.name}
                    </span>
                  ))}
                {skills.filter((skill) => skill.is_offered).length > 2 && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    +{skills.filter((skill) => skill.is_offered).length - 2} more
                  </span>
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
                  <span className="text-2xl font-bold text-gray-900">{user.time_wallet}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Skills</span>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{skills.filter((skill) => skill.is_offered).length}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Sessions</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {bookings.filter((booking) => booking.status === "Completed").length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Rank</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {leaderboard.findIndex((entry) => entry.user.id === user.id) + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Sessions</h3>
            <p className="text-gray-600 mt-1">Your scheduled skill exchange sessions</p>
          </div>
          <div>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
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
                          <h4 className="font-medium text-gray-900">{session.skill.name}</h4>
                          <p className="text-sm text-gray-600">
                            {session.requester.id === user.id
                              ? `Learning from ${session.provider.name}`
                              : `Teaching ${session.requester.name}`}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          <p className="text-sm font-medium text-gray-900">{formatDate(session.scheduled_time)}</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(session.scheduled_time)} • {session.duration} min
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
            <p className="text-gray-600 mt-1">Your time credit activity</p>
          </div>
          <div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start gap-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      transaction.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{transaction.reason}</p>
                      <p
                        className={`text-sm font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </p>
                    </div>
                    {/* <p className="text-xs text-gray-600">
                      {formatDistanceToNow (new Date(transaction.timestamp), { addSuffix: true })}
                    </p> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
          <p className="text-gray-600 mt-1">Top contributors this week</p>
        </div>
        <div>
          <div className="space-y-4">
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {index + 1}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 border border-gray-300">
                    <img src={entry.user.profile_picture || ""} alt={entry.user.name} className="object-cover w-full h-full" />
                    {!entry.user.profile_picture && (
                        <div className="flex items-center justify-center h-full w-full bg-gray-200 text-sm font-semibold text-gray-700">
                            {entry.user.name.charAt(0)}
                        </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{entry.user.name}</p>
                    <p className="text-xs text-gray-600">@{entry.user.username}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{entry.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}