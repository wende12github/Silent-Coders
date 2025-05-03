import { AxiosResponse } from "axios";
import { apiClient } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { REFRESH_TOKEN_STORAGE_KEY } from "../utils/constants";

export interface LogoutResponse {
  refresh: string;
}

export const useLogout = () => {
  const { clearTokens, setAuthenticated } = useAuthStore();

  const logoutUser = async (): Promise<LogoutResponse | null> => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!storedRefreshToken) {
      setAuthenticated(false);
      return null;
    }

    try {
      const response: AxiosResponse<LogoutResponse> = await apiClient.post(
        "/auth/logout/",
        { refresh_token: storedRefreshToken }
      );
      console.log("Logout user response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error logging out user:", error);
      throw error;
    } finally {
      clearTokens();
      useAuthStore.getState().setAuthenticated(false);
    }
  };

  return { logoutUser };
};
