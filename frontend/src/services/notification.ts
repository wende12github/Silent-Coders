import { apiClient } from "./api";
import axios from "axios";
import { Notification } from "../store/types";
import { PaginatedResponse } from "./api";

/**
 * Fetches notifications for the current user.
 * @returns {Promise<PaginatedResponse<Notification>>} - A paginated list of notifications.
 */
export const fetchNotifications = async (
  page: number = 1
): Promise<PaginatedResponse<Notification>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      "/notifications/",
      { params: { page } }
    );
    console.log("Fetched notifications:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Marks a specific notification as read
export const markNotificationAsRead = async (
  notificationId: number
): Promise<Notification> => {
  try {
    const response = await apiClient.post<Notification>(
      `/notifications/${notificationId}/mark-read/`
    );
    console.log(
      `Notification ${notificationId} marked as read:`,
      response.data
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

// Delete a notification
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}/`);
    console.log(`Deleted notification ${notificationId}`);
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    throw error;
  }
};
