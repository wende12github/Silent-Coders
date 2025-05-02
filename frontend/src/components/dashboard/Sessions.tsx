import React, { useState } from "react";
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
  id: number;
  skill: Skill;
  requester: User;
  provider: User;
  scheduled_time: string;
  duration: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

const useAuth = () => {
  const user: User = {
    id: "user-123",
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    time_wallet: 120,
    profile_picture: "https://placehold.co/100x100/4f46e5/ffffff?text=JD",
  };

  const initialBookings: Booking[] = [
    {
      id: 1,
      skill: { id: "skill-1", name: "Web Development", is_offered: true },
      requester: user,
      provider: {
        id: "user-456",
        name: "Jane Smith",
        username: "janesmith",
        email: "jane.smith@example.com",
        time_wallet: 200,
      },
      scheduled_time: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 2
      ).toISOString(),
      duration: 60,
      status: "Confirmed",
    },
    {
      id: 2,
      skill: { id: "skill-2", name: "Graphic Design", is_offered: true },
      requester: {
        id: "user-789",
        name: "Peter Jones",
        username: "peterj",
        email: "peter.jones@example.com",
        time_wallet: 50,
      },
      provider: user,
      scheduled_time: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      duration: 30,
      status: "Pending",
    },
    {
      id: 3,
      skill: { id: "skill-3", name: "Spanish Tutoring", is_offered: false },
      requester: user,
      provider: {
        id: "user-101",
        name: "Maria Garcia",
        username: "mariag",
        email: "maria.garcia@example.com",
        time_wallet: 150,
      },
      scheduled_time: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 7
      ).toISOString(),
      duration: 45,
      status: "Completed",
    },
    {
      id: 4,
      skill: { id: "skill-4", name: "Photography", is_offered: true },
      requester: {
        id: "user-202",
        name: "David Lee",
        username: "davidl",
        email: "david.lee@example.com",
        time_wallet: 80,
      },
      provider: user,
      scheduled_time: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 1
      ).toISOString(),
      duration: 90,
      status: "Cancelled",
    },
  ];

  return { user, bookings: initialBookings };
};

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}) => (
  <div
    className={`relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 ${
      className || ""
    }`}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
    ) : (
      <div
        className={`flex items-center justify-center h-full w-full bg-gray-200 text-sm font-semibold text-gray-700 ${
          fallbackClassName || ""
        }`}
      >
        {fallback.charAt(0)}
      </div>
    )}
  </div>
);

export default function Sessions() {
  const { bookings: initialBookings, user } = useAuth();
  const [bookings, setBookings] = useState(initialBookings);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const upcomingBookings = filteredBookings.filter(
    (booking) => !isPast(new Date(booking.scheduled_time))
  );
  const pastBookings = filteredBookings.filter((booking) =>
    isPast(new Date(booking.scheduled_time))
  );

  const getOtherParticipant = (booking: Booking) => {
    return booking.provider.id === user?.id
      ? booking.requester
      : booking.provider;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Completed":
        return <Badge variant="info">Completed</Badge>;
      case "Cancelled":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = (bookingId: number, newStatus: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: newStatus as any }
          : booking
      )
    );

    console.log(`Booking ${bookingId} status changed to ${newStatus}`);
  };

  const sessionTabs: TabItem[] = [
    {
      value: "upcoming",
      label: "Upcoming",
      content:
        upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => {
              const otherParticipant = getOtherParticipant(booking);
              const isProvider = booking.provider.id === user?.id;
              return (
                <Card key={booking.id} className="space-y-1">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          {booking.skill.name}
                          <span className="ml-2">
                            {getStatusBadge(booking.status)}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {isProvider ? "Teaching" : "Learning from"}{" "}
                          <span className="font-medium text-gray-900">
                            {otherParticipant.name}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-4 w-4 text-gray-600" />
                          {formatDate(booking.scheduled_time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-1 h-4 w-4 text-gray-600" />
                          {formatTime(booking.scheduled_time)} (
                          {booking.duration} min)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={otherParticipant.profile_picture}
                          alt={otherParticipant.name}
                          fallback={otherParticipant.name}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {otherParticipant.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            @{otherParticipant.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1" />
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "Pending" && isProvider && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() =>
                                handleStatusChange(booking.id, "Confirmed")
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
                                handleStatusChange(booking.id, "Cancelled")
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                          </>
                        )}
                        {booking.status === "Confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() =>
                              handleStatusChange(booking.id, "Cancelled")
                            }
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        )}

                        {booking.status === "Confirmed" && (
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
            <CardContent className="flex flex-col items-center justify-center py-10">
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
        pastBookings.length > 0 ? (
          <div className="space-y-4">
            {pastBookings.map((booking) => {
              const otherParticipant = getOtherParticipant(booking);
              const isProvider = booking.provider.id === user?.id;
              return (
                <Card key={booking.id} className="space-y-1">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          {booking.skill.name}
                          <span className="ml-2">
                            {getStatusBadge(booking.status)}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {isProvider ? "Taught" : "Learned from"}{" "}
                          <span className="font-medium text-gray-900">
                            {otherParticipant.name}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-4 w-4 text-gray-600" />
                          {formatDate(booking.scheduled_time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-1 h-4 w-4 text-gray-600" />
                          {formatTime(booking.scheduled_time)} (
                          {booking.duration} min)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={otherParticipant.profile_picture}
                          alt={otherParticipant.name}
                          fallback={otherParticipant.name}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {otherParticipant.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            @{otherParticipant.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1" />

                      {booking.status === "Completed" && (
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      )}
                      {booking.status === "Cancelled" && (
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
    <div className="p-6 space-y-6 min-h-screen w-full">
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
