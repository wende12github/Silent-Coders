import { AxiosError } from "axios";
import { apiClient } from "./api";


interface PasswordChangeData {
  old_password: string;
  new_password: string;
}


export interface EmailPreferencesData {
  newsletter: boolean;
  updates: boolean;
  skill_match_alerts: boolean;
}



interface EmailPreferencesResponse {
  newsletter: boolean;
  updates: boolean;
  skill_match_alerts: boolean;
}


/**
 * Resets the authenticated user's password.
 * Backend uses UpdatePasswordView (POST) at /auth/me/password/.
 * @param passwordData The old and new password.
 * @returns A promise resolving when the password is updated successfully.
 * @throws AxiosError if the API call fails (e.g., wrong old password, validation errors).
 */
export const resetPassword = async (
  passwordData: PasswordChangeData
): Promise<void> => {
  try {

    const response = await apiClient.post("/auth/me/password/", passwordData);
    console.log("Reset password response:", response.data);

    return;
  } catch (error) {
    console.error("Error resetting password:", error);

    throw error as AxiosError;
  }
};





/**
 * Updates the authenticated user's email notification preferences.
 * Backend uses UpdateEmailPreferencesView (PATCH/PUT) at /auth/me/preferences/.
 * @param preferencesData The preferences to update.
 * @returns A promise resolving to the updated EmailPreferencesResponse object.
 * @throws AxiosError if the API call fails.
 */
export const updatePreferences = async (
  preferencesData: Partial<EmailPreferencesData>
): Promise<EmailPreferencesResponse> => {
  try {


    const response = await apiClient.patch<EmailPreferencesResponse>(
      "/auth/me/preferences/",
      preferencesData
    );
    console.log("Update preferences response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating preferences:", error);

    throw error as AxiosError;
  }
};

/**
 * Fetches the authenticated user's email notification preferences.
 * Backend uses UpdateEmailPreferencesView (GET) at /auth/me/preferences/.
 * @returns A promise resolving to the EmailPreferencesResponse object.
 * @throws AxiosError if the API call fails.
 */
export const fetchEmailPreferences = async (): Promise<EmailPreferencesResponse> => {
  try {

    const response = await apiClient.get<EmailPreferencesResponse>(
      "/auth/me/preferences/"
    );
    console.log("Fetch email preferences response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching email preferences:", error);

    throw error as AxiosError;
  }
};









