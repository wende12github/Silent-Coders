import { apiClient } from "./api";

// Reset user password
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

// Update user data (bio, username, availability)
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

// Update user preferences
export const updatePreferences = async (preferencesData: {
  newsletter: boolean;
  updates: boolean;
  skill_match_alerts: boolean;
}): Promise<void> => {
  try {
    const response = await apiClient.patch("/auth/me/preferences/", preferencesData);
    console.log("Update preferences response:", response.data);
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};