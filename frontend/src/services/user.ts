import { AxiosError } from "axios";
import { PublicUser, CurrentUser, AvailabilityChoices } from "../store/types";
import { apiClient } from "./api";

export interface UpdateCurrentUserPayload {
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string | null;
  availability?: AvailabilityChoices;
  profile_picture?: File | null;
}

/**
 * Fetches a public user profile by ID.
 * Backend uses PublicUserDetailView at /users/{pk}/.
 * @param userId The ID of the user to fetch.
 * @returns A promise resolving to a PublicUser object.
 * @throws AxiosError if the API call fails (e.g., 404 if user not found).
 */
export const fetchPublicUser = async (userId: number): Promise<PublicUser> => {
  try {
    const response = await apiClient.get<PublicUser>(`/users/${userId}/`);
    console.log(`Fetched public user ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public user ${userId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches the authenticated user's profile.
 * Backend uses CurrentUserView at /auth/me/.
 * @returns A promise resolving to a CurrentUser object.
 * @throws AxiosError if the API call fails (e.g., 401 if not authenticated).
 */
export const fetchMe = async (): Promise<CurrentUser> => {
  try {
    const response = await apiClient.get<CurrentUser>("/auth/me/");
    console.log("Fetched current user profile:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    throw error as AxiosError;
  }
};

/**
 * Updates the authenticated user's profile.
 * Backend uses CurrentUserView (PUT/PATCH) at /auth/me/.
 * @param userId The ID of the user to update (should be the authenticated user's ID).
 * @param updateData The payload with fields to update.
 * @returns A promise resolving to the updated CurrentUser object.
 * @throws AxiosError if the API call fails (e.g., 400 for validation errors).
 */
export const updateCurrentUser = async (
  updateData: UpdateCurrentUserPayload
): Promise<CurrentUser> => {
  try {
    const formData = new FormData();

    if (updateData.username !== undefined) {
      formData.append("username", updateData.username);
    }
    if (updateData.first_name !== undefined) {
      formData.append("first_name", updateData.first_name);
    }
    if (updateData.last_name !== undefined) {
      formData.append("last_name", updateData.last_name);
    }
    if (updateData.bio !== undefined) {
      if (updateData.bio === null) {
        formData.append("bio", "");
      } else {
        formData.append("bio", updateData.bio);
      }
    }
    if (updateData.availability !== undefined) {
      formData.append("availability", updateData.availability);
    }

    if (updateData.profile_picture !== undefined) {
      if (updateData.profile_picture === null) {
        formData.append("profile_picture", "");
      } else {
        formData.append("profile_picture", updateData.profile_picture);
      }
    }

    const response = await apiClient.patch<CurrentUser>("/auth/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Updated current user profile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating current user profile:", updateData, error);
    throw error as AxiosError;
  }
};
