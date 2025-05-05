import { useEffect, useState } from "react";
import { Calendar, Clock, Video, MapPin, Check, X } from "lucide-react";
import { format, isPast } from "date-fns";
import Tabs, { TabItem } from "../ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import Button from "../ui/Button";
import { Select, SelectItem } from "../ui/Select";
// import Avatar from "../ui/Avatar";
import { Booking } from "../../store/types";
import { fetchMyBookings } from "../../services/booking";
import { useAuthStore } from "../../store/authStore";

export default function Sessions() {
  const [sessions, setSessions] = useState<Booking[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { user } = useAuthStore();

  useEffect(() => {
    const loadSessions = async () => {
      const data = await fetchMyBookings();
      setSessions(data);
    };
    loadSessions();
  }, [sessions]);

  if (!sessions || sessions.length === 0) {
    return <div>No sessions found</div>;
  }

  const filteredSessions = sessions?.filter((session) => {
    if (statusFilter !== "all" && session.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const upcomingSessions = filteredSessions?.filter(
    (session) => !isPast(new Date(session.scheduled_time))
  );
  const pastSessions = filteredSessions?.filter((session) =>
    isPast(new Date(session.scheduled_time))
  );

  // const getOtherParticipant = (session: Booking) => {
  //   return session.provider === user?.id
  //     ? session.requester
  //     : session.provider;
  // };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "completed":
        return <Badge variant="info">Completed</Badge>;
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = (sessionId: number, newStatus: string) => {
    console.log(`Session ${sessionId} status changed to ${newStatus}`);
  };

  const sessionTabs: TabItem[] = [
    {
      value: "upcoming",
      label: "Upcoming",
      content:
        upcomingSessions.length > 0 ? (
          <div className="space-y-4">
            {upcomingSessions.map((session) => {
              // const otherParticipant = getOtherParticipant(session);
              const isProvider = session.booked_for === user?.username;
              return (
                <Card key={session.id} className="space-y-1">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          <span className="ml-2">
                            {session.status && getStatusBadge(session.status)}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {isProvider ? "Teaching" : "Learning from"}{" "}
                          <span className="font-medium text-gray-900">
                            {/* {otherParticipant} */}
                            first_name
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-4 w-4 text-gray-600" />
                          {formatDate(session.scheduled_time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-1 h-4 w-4 text-gray-600" />
                          {formatTime(session.scheduled_time)} (
                          {session.duration} min)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        {/* <Avatar
                          src={otherParticipant.profile_picture}
                          alt={otherParticipant.first_name}
                          fallback={otherParticipant.first_name}
                        /> */}
                        <div className="size-6 animate-pulse rounded-md"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {/* {otherParticipant.} */}
                            first_name
                          </p>
                          <p className="text-xs text-gray-600">
                            {/* @{otherParticipant.username} */}
                            @username
                          </p>
                        </div>
                      </div>
                      <div className="flex-1" />
                      <div className="flex flex-wrap gap-2">
                        {session.status === "pending" && isProvider && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() =>
                                handleStatusChange(session.id, "Confirmed")
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-50"
                              onClick={() =>
                                handleStatusChange(session.id, "Cancelled")
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                          </>
                        )}
                        {session.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() =>
                              handleStatusChange(session.id, "Cancelled")
                            }
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        )}

                        {session.status === "confirmed" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Video className="mr-2 h-4 w-4" />
                              Join Online
                            </Button>

                            <Button variant="outline" size="sm">
                              <MapPin className="mr-2 h-4 w-4" />
                              Get Directions
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 pt-10">
              <Calendar className="h-10 w-10 text-gray-600 mb-4" />
              <p className="text-center text-gray-600 mb-4">
                You don't have any upcoming sessions.
              </p>
              <Button>Schedule a Session</Button>
            </CardContent>
          </Card>
        ),
    },
    {
      value: "past",
      label: "Past",
      content:
        pastSessions.length > 0 ? (
          <div className="space-y-4">
            {pastSessions.map((session) => {
              // const otherParticipant = getOtherParticipant(session);
              const isProvider = session.booked_for === user?.username;
              return (
                <Card key={session.id} className="space-y-1">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          session.skill.name
                          {/* {session.skill.name} */}
                          <span className="ml-2">
                            {getStatusBadge(session.status)}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {isProvider ? "Taught" : "Learned from"}{" "}
                          <span className="font-medium text-gray-900">
                            otherParticipant.first_name
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-4 w-4 text-gray-600" />
                          {formatDate(session.scheduled_time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-1 h-4 w-4 text-gray-600" />
                          {formatTime(session.scheduled_time)} (
                          {session.duration} min)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        {/* <Avatar
                          src={otherParticipant.profile_picture}
                          alt={otherParticipant.first_name}
                          fallback={otherParticipant.first_name}
                        /> */}
                        <div className="size-6 animate-pulse rounded-md"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            otherParticipant.first_name
                            {/* {otherParticipant.first_name} */}
                          </p>
                          <p className="text-xs text-gray-600">
                            @other.username
                            {/* @{otherParticipant.username} */}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1" />

                      {session.status === "completed" && (
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      )}
                      {session.status === "cancelled" && (
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-10 w-10 text-gray-600 mb-4" />
              <p className="text-center text-gray-600 mb-4">
                You don't have any past sessions.
              </p>
            </CardContent>
          </Card>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6 h-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sessions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your skill exchange sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-sm">Filter by status:</span>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Filter by status"
            className="w-[180px]"
          >
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="upcoming" items={sessionTabs} tabsListClassName="" />
    </div>
  );
}
