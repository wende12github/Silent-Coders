import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle } from "lucide-react";
import { Notification } from "../store/types";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../services/notification";
import Button from "../components/ui/Button";

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
      setNotifications((prev) => [...prev, ...data.results]);
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
    if (nextPage) {
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

      alert(`Failed to mark notification as read: ${err.message}`);
    }
  };

  const formatCreationTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="p-6 w-full mx-auto space-y-8 rounded-lg shadow-md">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Notifications
        </h1>
        <p className="text-gray-600 mt-1">
          Stay updated on your TimeBank activity
        </p>
      </div>

      <div className="space-y-4">
        {isLoading && notifications.length === 0 ? (
          <div className="text-center text-gray-500">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="text-center text-red-500">Error: {error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500">No new notifications.</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                notification.is_read
                  ? "bg-gray-100 border-gray-200"
                  : "bg-white border-blue-200 shadow-sm hover:bg-blue-50"
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  notification.is_read ? "text-gray-500" : "text-blue-600"
                }`}
              >
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    notification.is_read
                      ? "text-gray-700"
                      : "text-gray-900 font-medium"
                  }`}
                >
                  {notification.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCreationTime(notification.created_at)}
                </p>
              </div>
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                  aria-label={`Mark notification ${notification.id} as read`}
                >
                  <CheckCircle size={20} />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {nextPage && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
