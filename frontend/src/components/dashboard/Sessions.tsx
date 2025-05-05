import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  MessageSquare,
  Check,
  Star,
} from "lucide-react";
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
import { Booking, Skill } from "../../store/types";

import { fetchMyBookings, updateBookingStatus } from "../../services/booking";
import { useAuthStore } from "../../store/authStore";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Input, Textarea } from "../ui/Form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../../services/api";

export default function Sessions() {
  const [sessions, setSessions] = useState<Booking<Skill>[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [sessionToCancelId, setSessionToCancelId] = useState<number | null>(
    null
  );
  const [cancelReason, setCancelReason] = useState("");

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [sessionToReviewId, setSessionToReviewId] = useState<number | null>(
    null
  );
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { user } = useAuthStore();

  const loadSessions = async () => {
    try {
      const data = await fetchMyBookings();
      setSessions(data);

      console.log("sessions loaded");
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load sessions.");
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((session) =>
    statusFilter === "all"
      ? true
      : session.status?.toLowerCase() === statusFilter.toLowerCase()
  );

  const upcomingSessions = filteredSessions.filter(
    (s) => !isPast(new Date(s.scheduled_time))
  );
  const pastSessions = filteredSessions.filter((s) =>
    isPast(new Date(s.scheduled_time))
  );

  const formatDate = (date: string) =>
    format(new Date(date), "EEEE, MMMM d, yyyy");
  const formatTime = (date: string) => format(new Date(date), "h:mm a");

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
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

  const handleStatusChange = async (
    id: number,
    newStatus: "confirmed" | "cancelled" | "completed",
    reason?: string
  ) => {
    try {
      await updateBookingStatus(id, newStatus, reason);
      toast.success(`Session status updated to ${newStatus}.`);
      await loadSessions();
    } catch (error) {
      console.error(`Failed to update session status to ${newStatus}:`, error);
      toast.error(`Failed to update session status to ${newStatus}.`);
    }
  };

  const openCancelDialog = (id: number) => {
    setSessionToCancelId(id);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (sessionToCancelId != null) {
      await handleStatusChange(sessionToCancelId, "cancelled", cancelReason);
      setIsCancelDialogOpen(false);
      setCancelReason("");
      setSessionToCancelId(null);
    }
  };

  const navigate = useNavigate();

  function goToChat(userId: string | number): void {
    navigate(`/dashboard/chat?userId=${userId}`);
  }

  const markAsComplete = async (id: number) => {
    await handleStatusChange(id, "completed", "");
  };

  const openReviewDialog = (id: number) => {
    setSessionToReviewId(id);
    setReviewRating(null);
    setReviewText("");
    setIsReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (
      sessionToReviewId === null ||
      reviewRating === null ||
      !reviewText.trim()
    ) {
      toast.warning("Please provide both a rating and a review.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await apiClient.post(
        `/bookings/bookings/${sessionToReviewId}/review/`,
        {
          rating: reviewRating,
          comment: reviewText.trim(),
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Review submitted successfully!");

        await loadSessions();
        setIsReviewDialogOpen(false);
        setSessionToReviewId(null);
        setReviewRating(null);
        setReviewText("");
      } else {
        toast.error("Failed to submit review. Please try again.");
        console.error(
          "Review submission failed with status:",
          response.status,
          response.data
        );
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);

      const errorMessage =
        error?.response?.data?.detail ||
        error.message ||
        "An unexpected error occurred.";
      toast.error(`Failed to submit review: ${errorMessage}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderSessionCard = (session: Booking<Skill>, isPast: boolean) => {
    const isProvider = session.booked_for === user?.username;

    const participantUsername = isProvider
      ? session.booked_by
      : session.booked_for;

    const participantIdentifierForChat = participantUsername;

    return (
      <Card key={session.id}>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center text-lg font-semibold">
                {session.skill.name}
                <span className="ml-2">{getStatusBadge(session.status)}</span>
              </CardTitle>
              <CardDescription>
                {isProvider ? "Teaching" : "Learning from"}{" "}
                <span className="font-medium text-gray-900">
                  {participantUsername}
                </span>
              </CardDescription>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />{" "}
                {formatDate(session.scheduled_time)}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />{" "}
                {formatTime(session.scheduled_time)} ({session.duration} min)
              </div>
              <div className="flex items-center">
                {session.skill.location === "remote" ? (
                  <Video className="mr-2 h-4 w-4" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                {session.skill.location === "remote"
                  ? "Online Meeting"
                  : session.skill.address}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-sm">
            <div className="text-gray-800 font-medium">
              {participantUsername}
            </div>

            <div className="text-gray-500">@{participantUsername}</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {session.status === "pending" && isProvider && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(session.id, "confirmed")}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => openCancelDialog(session.id)}
                >
                  Decline
                </Button>
              </>
            )}
            {session.status === "pending" && !isProvider && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => openCancelDialog(session.id)}
              >
                Decline
              </Button>
            )}

            {session.status === "confirmed" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => openCancelDialog(session.id)}
                >
                  Cancel
                </Button>
                {session.skill.location === "remote" && (
                  <Button variant="outline" size="sm" asChild>
                    <button>
                      <Video className="mr-2 h-4 w-4" /> Join Online
                    </button>
                  </Button>
                )}
                {session.skill.location === "local" && (
                  <Button variant="outline" size="sm" asChild>
                    <button>
                      <MapPin className="mr-2 h-4 w-4" /> Get Directions
                    </button>
                  </Button>
                )}
              </>
            )}

            {session.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToChat(participantIdentifierForChat)}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Chat
              </Button>
            )}

            {(session.status === "pending" ||
              session.status === "confirmed") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsComplete(session.id)}
              >
                <Check className="mr-2 h-4 w-4" /> Mark Complete
              </Button>
            )}

            {session.status === "completed" &&
              session.booked_by === user?.username && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openReviewDialog(session.id)}
                >
                  <Star className="mr-2 h-4 w-4 fill-current text-yellow-500" />{" "}
                  Add Review
                </Button>
              )}

            {isPast && (
              <Button variant="outline" size="sm">
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const sessionTabs: TabItem[] = [
    {
      value: "upcoming",
      label: "Upcoming",
      content: upcomingSessions.length ? (
        <div className="space-y-4">
          {upcomingSessions.map((s) => renderSessionCard(s, false))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <Calendar className="mx-auto h-10 w-10 text-gray-600 mb-4" />
            <p>No upcoming sessions.</p>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "past",
      label: "Past",
      content: pastSessions.length ? (
        <div className="space-y-4">
          {pastSessions.map((s) => renderSessionCard(s, true))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <Calendar className="mx-auto h-10 w-10 text-gray-600 mb-4" />
            <p>No past sessions.</p>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-1">
            Manage your skill exchange sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Filter by status:</span>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-48"
          >
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="upcoming" items={sessionTabs} />

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <div>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="reason" className="block text-sm font-medium">
              Reason
            </label>
            <Input
              id="reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1"
              placeholder="e.g., scheduling conflict"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason("");
                setSessionToCancelId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmCancel} disabled={!cancelReason.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <div>
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
            <DialogDescription>
              Share your experience and rate the session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium mb-1"
              >
                Rating (1-5)
              </label>
              <Select
                value={reviewRating != null ? String(reviewRating) : ""}
                onValueChange={(value) => setReviewRating(Number(value))}
              >
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </Select>
            </div>

            <div>
              <label
                htmlFor="review"
                className="block text-sm font-medium mb-1"
              >
                Review
              </label>

              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mt-1"
                placeholder="Write your review here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setSessionToReviewId(null);
                setReviewRating(null);
                setReviewText("");
              }}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={
                sessionToReviewId === null ||
                reviewRating === null ||
                !reviewText.trim() ||
                isSubmittingReview
              }
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
