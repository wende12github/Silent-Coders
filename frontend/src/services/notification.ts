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
 * @param url - Optional URL to fetch notifications from (for pagination)
 * @returns {Promise<PaginatedResponse<Notification>>} - A paginated list of notifications.
 */
export const fetchNotifications = async (
  url?: string
): Promise<PaginatedResponse<Notification>> => {
  try {
    const response = url 
      ? await apiClient.get<PaginatedResponse<Notification>>(url)
      : await apiClient.get<PaginatedResponse<Notification>>("/notifications/");
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
    throw new Error("An unexpected error occurred while fetching notifications.");
  }
};

/**
 * Marks a specific notification as read
 * @param notificationId - ID of the notification to mark as read
 * @returns {Promise<Notification>} - The updated notification
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<Notification> => {
  try {
    const response = await apiClient.post<Notification>(
      `/notifications/${notificationId}/mark-read/`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error
    );
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          `Failed to mark notification ${notificationId} as read.`
      );
    }
    throw new Error(
      `An unexpected error occurred while marking notification ${notificationId} as read.`
    );
  }
};

/**
 * Deletes a notification
 * @param notificationId - ID of the notification to delete
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
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