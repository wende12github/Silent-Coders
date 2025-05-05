import { AxiosResponse } from "axios";
import {
  apiClient,
  AuthResponse,
  fetchCurrentUser,
  setAuthToken,
  storeRefreshToken,
} from "../services/api";
import { useAuthStore } from "../store/authStore";
import { REFRESH_TOKEN_STORAGE_KEY } from "../utils/constants";
import { fetchMe } from "../services/user";
import { User } from "../store/types";

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

  return { logout: logoutUser };
};

export const useLogin = () => {
  const { setTokens } = useAuthStore();

  const loginUser = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        "/auth/login/",
        credentials
      );
      console.log("Login user response:", response.data);
      setTokens(response.data.access, response.data.refresh);
      storeRefreshToken(response.data.refresh);
      setAuthToken(response.data.access);
      const currentUser = await fetchCurrentUser();
      console.log("Current user:", currentUser);
      useAuthStore.getState().setUser(currentUser);
      useAuthStore.getState().setAuthenticated(true);
      return response.data;
    } catch (error: any) {
      console.error("Error logging in user:", error);
      throw error;
    }
  };

  return { login: loginUser };
};
export interface RegisterUserData {
  email: string;
  password: string;
  username: string;
  bio: string | null;
  first_name: string;
  last_name: string;
}
export const useSignup = () => {
  const signupUser = async (userData: RegisterUserData) => {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        "/auth/register/",
        userData
      );
      console.log("Register user response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error signing up user:", error);
      throw error;
    }
  };

  return { signup: signupUser };
};

export const useCurrentUser = async () => {
  const user: User = await fetchMe();
  return { user };
};
