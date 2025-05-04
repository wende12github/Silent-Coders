import { apiClient } from "./api";
import axios from "axios";
import { Notification } from "../store/types";
/**
 * Fetches notifications for the current user.
 * @returns {Promise<Notification[]>} - A list of notifications.
 */

export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<Notification[]>("/notifications/");
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
 * Marks a specific notification as read.
 * @param {number} notificationId - The ID of the notification to mark as read.
 * @returns {Promise<Notification>} - The updated notification object.
 */
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
