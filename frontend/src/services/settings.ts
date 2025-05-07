import { apiClient } from "./api";
import { AxiosResponse } from "axios";

interface UserSettings{
  
}

export const resetPassword = async (passwordData: {
  old_password: string;
  new_password: string;
}): Promise<void> => {
  try {
    const response = await apiClient.post("/auth/me/password/", passwordData);
    console.log("Reset password response:", response.data);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const updateUserData = async (userData: {
  bio?: string;
  username?: string;
  availability?: string;
}): Promise<void> => {
  try {
    const response = await apiClient.patch("/auth/me/update/", userData);
    console.log("Update user data response:", response.data);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const updatePreferences = async (preferencesData: {
  newsletter: boolean;
  updates: boolean;
  skill_match_alerts: boolean;
}): Promise<void> => {
  try {
    const response = await apiClient.patch(
      "/auth/me/preferences/",
      preferencesData
    );
    console.log("Update preferences response:", response.data);
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

export const fetchUserSettings = async (): Promise<UserSettings> => {
  try {
    const response: AxiosResponse<UserSettings> = await apiClient.get(
      "/settings/"
    );
    console.log("Fetch user settings response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw error;
  }
};

export const updateUserSettings = async (
  settingsData: Partial<UserSettings>
): Promise<UserSettings> => {
  try {
    const response: AxiosResponse<UserSettings> = await apiClient.patch(
      "/settings/",
      settingsData
    );
    console.log("Update user settings response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
};
