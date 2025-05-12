import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { User, WalletTransaction } from "../store/types";

import { useAuthStore } from "../store/authStore";

import { API_BASE_URL, REFRESH_TOKEN_STORAGE_KEY } from "../utils/constants";

export interface AuthResponse {
  refresh: string;
  access: string;
}

interface WalletBalanceResponse {
  balance: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchPaginatedData<T>(
  endpoint: string,
  page: number = 1
): Promise<PaginatedResponse<T>> {
  try {
    const response = await apiClient.get<PaginatedResponse<T>>(endpoint, {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}?page=${page}:`, error);
    throw error;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}[] = [];

/**
 * Processes the queue of failed requests after a successful token refresh.
 * @param newToken - The new access token.
 */
const processQueue = (newToken: string | null) => {
  failedQueue.forEach((prom) => {
    if (newToken) {
      prom.config.headers["Authorization"] = `Bearer ${newToken}`;
      apiClient(prom.config).then(prom.resolve).catch(prom.reject);
    } else {
      prom.reject(new Error("Token refresh failed"));
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ config: originalRequest, resolve, reject });
        });
      }

      isRefreshing = true;

      const authStore = useAuthStore.getState();
      const refreshToken =
        authStore.refreshToken ||
        localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      if (!refreshToken) {
        console.error(
          "No refresh token available. User needs to log in again."
        );
        authStore.clearTokens();
        authStore.setAuthenticated(false);

        processQueue(null);
        return Promise.reject(error);
      }
      console.log("refreshToken", refreshToken);

      try {
        const response: AxiosResponse<AuthResponse> = await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;

        console.log("Refresh token and ACcess token", response.data);

        if (access) {
          authStore.setTokens(access, refreshToken);
          setAuthToken(access);

          processQueue(access);

          originalRequest.headers["Authorization"] = `Bearer ${access}`;
          return apiClient(originalRequest);
        } else {
          console.error(
            "Token refresh endpoint returned success but missing tokens."
          );
          authStore.clearTokens();
          authStore.setAuthenticated(false);
          processQueue(null);
          return Promise.reject(new Error("Invalid refresh token response"));
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        authStore.clearTokens();
        authStore.setAuthenticated(false);
        processQueue(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Sets or removes the Authorization header with the Bearer token.
 * @param token - The access token string, or null/undefined to remove the header.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

/**
 * Stores the refresh token in local storage.
 * Note: This is also handled by the auth store's persist middleware,
 * but this function can be used explicitly if needed elsewhere.
 * @param refreshToken - The refresh token string.
 */
export const storeRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

/**
 * Fetches the current user's profile.
 * @returns {Promise<User>} - The current user's profile data.
 */
export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await apiClient.get("/auth/me/");
    console.log("Fetch current user response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

/**
 * Fetches the current user's wallet balance.
 * @returns {Promise<WalletBalanceResponse>} - The wallet data (e.g., { balance }).
 */
export const fetchWalletBalance = async (): Promise<WalletBalanceResponse> => {
  try {
    const response: AxiosResponse<WalletBalanceResponse> = await apiClient.get(
      "/wallet/"
    );
    console.log("Fetch wallet balance response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
};

/**
 * Fetches the current user's wallet transactions.
 * @returns {Promise<WalletTransaction[]>} - A list of wallet transactions.
 */
export const fetchWalletTransactions = async (): Promise<
  WalletTransaction[]
> => {
  try {
    const response = await apiClient.get<PaginatedResponse<WalletTransaction>>(
      "/wallet/transactions/"
    );
    console.log("Fetch wallet transactions response:", response.data.results);
    return response.data.results;
  } catch (error: any) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
};
