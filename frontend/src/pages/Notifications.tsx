import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle } from "lucide-react";
import { Notification } from "../store/types";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../services/notification";
import Button from "../components/ui/Button";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<number | null>(1);

  const loadNotifications = async (pageNumber: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchNotifications(pageNumber);

      setNotifications((prev) => {
        const newNotifications = data.results.filter(
          (newNotif: Notification) =>
            !prev.some((prevNotif) => prevNotif.id === newNotif.id)
        );
        return [...prev, ...newNotifications];
      });

      setNextPage(data.next ? pageNumber + 1 : null);
    } catch (err: any) {
      console.error("Error loading notifications:", err);
      setError(err.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const handleLoadMore = () => {
    if (nextPage !== null && !isLoading) {
      loadNotifications(nextPage);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notification.id ? { ...notif, is_read: true } : notif
      )
    );

    try {
      await markNotificationAsRead(notification);

      toast.success("Notification marked as read.");
    } catch (err: any) {
      console.error(
        `Failed to mark notification ${notification.id} as read:`,
        err
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notification.id ? { ...notif, is_read: false } : notif
        )
      );
      toast.error(
        `Failed to mark notification as read: ${err.message || "Unknown error"}`
      );
    }
  };

  const formatCreationTime = (timestamp: string): string => {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div
      className="p-6 w-full mx-auto space-y-8 rounded-lg shadow-md
                   bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
          Notifications
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
          Stay updated on your TimeBank activity
        </p>
      </div>

      <div className="space-y-4">
        {isLoading && notifications.length === 0 ? (
          <div className="text-center text-muted-foreground dark:text-muted-foreground-dark">
            Loading notifications...
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="text-center text-destructive dark:text-destructive-dark">
            Error: {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted-foreground dark:text-muted-foreground-dark">
            No new notifications.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors
                         ${
                           notification.is_read
                             ? "bg-muted/50 border-border dark:bg-muted-dark/50 dark:border-border-dark"
                             : "bg-card border-primary dark:bg-card-dark dark:border-primary-dark shadow-sm hover:bg-accent/50 dark:hover:bg-accent-dark/50"
                         }`}
            >
              <div
                className={`flex-shrink-0 ${
                  notification.is_read
                    ? "text-muted-foreground dark:text-muted-foreground-dark"
                    : "text-primary dark:text-primary-dark"
                }`}
              >
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    notification.is_read
                      ? "text-foreground dark:text-foreground-dark"
                      : "text-foreground dark:text-foreground-dark font-medium"
                  }`}
                >
                  {notification.content}
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">
                  {formatCreationTime(notification.created_at)}
                </p>
              </div>

              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-primary hover:text-primary/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
                  aria-label={`Mark notification ${notification.id} as read`}
                >
                  <CheckCircle size={20} />
                </Button>
              )}
            </div>
          ))
        )}

        {isLoading && notifications.length > 0 && (
          <div className="text-center text-muted-foreground dark:text-muted-foreground-dark">
            Loading more...
          </div>
        )}
      </div>

      {nextPage !== null && !isLoading && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            Load More
          </Button>
        </div>
      )}

      {error && notifications.length > 0 && (
        <div className="text-center text-destructive dark:text-destructive-dark">
          Error loading more: {error}
        </div>
      )}
    </div>
  );
}
