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

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications();

        const sortedData = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(sortedData);
      } catch (err: any) {
        console.error("Error loading notifications:", err);
        setError(err.message || "Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );

    try {
      await markNotificationAsRead(id);
    } catch (err: any) {
      console.error(`Failed to mark notification ${id} as read:`, err);

      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: false } : notif
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
        {isLoading ? (
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
                  onClick={() => handleMarkAsRead(notification.id)}
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
    </div>
  );
}
