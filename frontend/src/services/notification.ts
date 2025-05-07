import { apiClient } from "./api";
import axios from "axios";
import { Notification } from "../store/types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetches notifications for the current user.
 * @returns {Promise<Notification[]>} - A list of notifications.
 */

export const fetchNotifications = async (
  page = 1
): Promise<PaginatedResponse<Notification>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      "/notifications/",
      {
        params: {
          page,
        },
      }
    );
    console.log("Fetched notifications:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          "Failed to fetch notifications."
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching notifications."
    );
  }
};

/**
 * Marks a specific notification as read
 * @param notificationId - ID of the notification to mark as read
 * @returns {Promise<Notification>} - The updated notification
 */
export const markNotificationAsRead = async (
  notification: Notification
): Promise<Notification> => {
  try {
    const response = await apiClient.patch<Notification>(
      `/notifications/${notification.id}/mark-read/`,
      {
        type: notification.type,
        content: notification.content,
        is_read: true,
      }
    );
    console.log(`Notification ${notification} marked as read:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${notification} as read:`, error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          `Failed to mark notification ${notification} as read.`
      );
    }
    throw new Error(
      `An unexpected error occurred while marking notification ${notification} as read.`
    );
  }
};

// Delete a notification
export const deleteNotification = async (
  notificationId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}/`);
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          `Failed to delete notification ${notificationId}.`
      );
    }
    throw new Error(
      `An unexpected error occurred while deleting notification ${notificationId}.`
    );
  }
};