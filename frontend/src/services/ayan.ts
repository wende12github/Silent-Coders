import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  Announcement,
  Group,
  LeaderboardEntry,
  Session,
  Skill,
  User,
  WalletTransaction,
} from "../store/types";

import { API_BASE_URL, REFRESH_TOKEN_STORAGE_KEY } from "../utils/constants";
import { useAuthStore } from "../store/authStore";
export interface AuthResponse {
  refresh: string;
  access: string;
}

interface WalletBalanceResponse {
  balance: number;
}

interface TransferResponse {
  transaction: WalletTransaction;
}

// Interface for admin dashboard data (example)
interface AdminDashboardData {
  total_users: number;
  total_sessions: number;
  pending_sessions: number;
  // Add other admin stats
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.error("No refresh token found, user must log in again.");
        return Promise.reject(error);
      }

      try {
        refreshAccessToken();

        const newAccessToken = useAuthStore.getState().accessToken;

        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(error.config);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers["Authorization"];
  }
};

const storeRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

/**
 * Mock API call to register a new user.
 * @param {object} userData - User registration data (e.g., { email, password, name, username })
 * @returns {Promise<AuthResponse>} - The response data from the API.
 */
export interface RegisterUserData {
  email: string;
  password: string;
  username: string;
  bio: string | null;
  // name: string;
}
export const registerUser = async (
  userData: RegisterUserData
): Promise<void> => {
  try {
    const response = await apiClient.post("/auth/register/", userData);
    console.log("Register user response:", response.data);
  } catch (error: any) {
    // Use 'any' or a more specific error type if available
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Mock API call to log in a user.
 * @param {object} credentials - User login credentials (e.g., { email, password })
 * @returns {Promise<AuthResponse>} - The response data from the API (e.g., { token, user }).
 */
export const loginUser = async (credentials: {
  // done
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/login/",
      credentials
    );
    console.log("Login user response:", response.data);
    storeRefreshToken(response.data.refresh);
    setAuthToken(response.data.access);
    return response.data;
  } catch (error: any) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

/**
 * Mock API call to log out the current user.
 * @returns {Promise<object>} - The response data from the API.
 */

export interface LogoutResponse {
  refresh: string;
}

export const logoutUser = async (): Promise<LogoutResponse> => {
  const { setTokens } = useAuthStore();

  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

  try {
    const response: AxiosResponse<LogoutResponse> = await apiClient.post(
      "/auth/logout/",
      {
        refresh_token: storedRefreshToken,
      }
    );
    setTokens("", "");
    console.log("Logout user response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

/**
 * Mock API call to request a password reset.
 * @param {object} data - Password reset request data (e.g., { email })
 * @returns {Promise<object>} - The response data from the API.
 */

export const refreshAccessToken = async () => {
  const { setTokens } = useAuthStore();

  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
      refresh_token: refreshToken,
    });

    const data = await response.data();
    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token);
      apiClient.defaults.headers[
        "Authorization"
      ] = `Bearer ${data.access_token}`;
    } else {
      setTokens("", "");
      localStorage.removeItem("refresh_token");
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
};

export const requestPasswordReset = async (data: {
  email: string;
}): Promise<object> => {
  // Return type can be more specific
  try {
    const response: AxiosResponse<object> = await apiClient.post(
      "/auth/reset-password/",
      data
    );
    console.log("Request password reset response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

// --- Users & Profiles Endpoints ---

/**
 * Mock API call to fetch the current user's profile.
 * @returns {Promise<User>} - The current user's profile data.
 */


/**
 * Mock API call to update the current user's profile.
 * @param {object} profileData - The updated profile data.
 * @returns {Promise<User>} - The updated user profile data.
 */
export const updateCurrentUser = async (
  profileData: Partial<User>
): Promise<User> => {
  // Use Partial for partial updates
  try {
    const response: AxiosResponse<User> = await apiClient.put(
      "/users/me/",
      profileData
    );
    console.log("Update current user response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating current user:", error);
    throw error;
  }
};

/**
 * Mock API call to fetch a specific user's profile by ID.
 * @param {string} id - The ID of the user to fetch.
 * @returns {Promise<User>} - The user's profile data.
 */
export const fetchUserById = async (id: string): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await apiClient.get(`/users/${id}/`);
    console.log(`Fetch user ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

// --- Skills Endpoints ---

/**
 * Mock API call to create a new skill.
 * @param {object} skillData - The data for the new skill (e.g., { name, description, is_offered, tags }).
 * @returns {Promise<Skill>} - The created skill data.
 */
export const createSkill = async (
  skillData: Omit<Skill, "id" | "created_at" | "updated_at">
): Promise<Skill> => {
  // Omit generated fields
  try {
    const response: AxiosResponse<Skill> = await apiClient.post(
      "/skills/",
      skillData
    );
    console.log("Create skill response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

/**
 * Mock API call to fetch all skills.
 * @returns {Promise<Skill[]>} - A list of skills.
 */
export const fetchAllSkills = async (): Promise<Skill[]> => {
  try {
    const response: AxiosResponse<Skill[]> = await apiClient.get("/skills/");
    console.log("Fetch all skills response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all skills:", error);
    throw error;
  }
};

/**
 * Mock API call to search for skills by name.
 * @param {string} query - The search query for skill names.
 * @returns {Promise<Skill[]>} - A list of matching skills.
 */
export const searchSkills = async (query: string): Promise<Skill[]> => {
  try {
    const response: AxiosResponse<Skill[]> = await apiClient.get(
      `/skills/match/?q=${encodeURIComponent(query)}`
    );
    console.log(`Search skills "${query}" response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error searching skills "${query}":`, error);
    throw error;
  }
};

// --- Sessions Endpoints ---

/**
 * Mock API call to request a new session.
 * @param {object} sessionRequestData - Data for the session request (e.g., { skill_id, provider_id, scheduled_time, duration }).
 * @returns {Promise<Session>} - The created session request data.
 */
export const requestSession = async (sessionRequestData: {
  skill_id: string;
  provider_id: string;
  scheduled_time: string;
  duration: number;
}): Promise<Session> => {
  try {
    const response: AxiosResponse<Session> = await apiClient.post(
      "/sessions/request/",
      sessionRequestData
    );
    console.log("Request session response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error requesting session:", error);
    throw error;
  }
};

/**
 * Mock API call to fetch the current user's sessions.
 * @returns {Promise<Session[]>} - A list of the current user's sessions.
 */
export const fetchMySessions = async (): Promise<Session[]> => {
  try {
    const response: AxiosResponse<Session[]> = await apiClient.get(
      "/sessions/my/"
    );
    console.log("Fetch my sessions response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching my sessions:", error);
    throw error;
  }
};

/**
 * Mock API call to confirm a session.
 * @param {number} id - The ID of the session to confirm. (Using number based on SessionsPage)
 * @returns {Promise<Session>} - The updated session data.
 */
export const confirmSession = async (id: number): Promise<Session> => {
  try {
    const response: AxiosResponse<Session> = await apiClient.patch(
      `/sessions/${id}/confirm/`
    );
    console.log(`Confirm session ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error confirming session ${id}:`, error);
    throw error;
  }
};

/**
 * Mock API call to mark a session as complete.
 * @param {number} id - The ID of the session to complete. (Using number based on SessionsPage)
 * @returns {Promise<Session>} - The updated session data.
 */
export const completeSession = async (id: number): Promise<Session> => {
  try {
    const response: AxiosResponse<Session> = await apiClient.patch(
      `/sessions/${id}/complete/`
    );
    console.log(`Complete session ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error completing session ${id}:`, error);
    throw error;
  }
};

// --- Wallet Endpoints ---

/**
 * Mock API call to fetch the current user's wallet balance.
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
 * Mock API call to fetch the current user's wallet transactions.
 * @returns {Promise<WalletTransaction[]>} - A list of wallet transactions.
 */
export const fetchWalletTransactions = async (): Promise<WalletTransaction[]> => {
    try {
      const response = await apiClient.get("/wallet/transactions/");
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  };
  
  export const fetchCurrentUser = async (): Promise<User> => {
    try {
      const response = await apiClient.get("/auth/me/");
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

/**
 * Mock API call to transfer time credits.
 * @param {object} transferData - Data for the transfer (e.g., { recipient_id, amount }).
 * @returns {Promise<TransferResponse>} - The transaction details.
 */
export const transferCredits = async (transferData: {
  recipient_id: string;
  amount: number;
}): Promise<TransferResponse> => {
  try {
    const response: AxiosResponse<TransferResponse> = await apiClient.post(
      "/wallet/transfer/",
      transferData
    );
    console.log("Transfer credits response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error transferring credits:", error);
    throw error;
  }
};

// --- Leaderboard & Groups Endpoints ---

/**
 * Mock API call to fetch the leaderboard.
 * @returns {Promise<LeaderboardEntry[]>} - A list of leaderboard entries.
 */
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response: AxiosResponse<LeaderboardEntry[]> = await apiClient.get(
      "/leaderboard/"
    );
    console.log("Fetch leaderboard response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

/**
 * Mock API call to create a new group.
 * @param {object} groupData - Data for the new group (e.g., { name, description }).
 * @returns {Promise<Group>} - The created group data.
 */
export const createGroup = async (groupData: {
  name: string;
  description: string;
}): Promise<Group> => {
  try {
    const response: AxiosResponse<Group> = await apiClient.post(
      "/groups/",
      groupData
    );
    console.log("Create group response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating group:", error);
    throw error;
  }
};

/**
 * Mock API call to fetch a specific group by ID.
 * @param {string} id - The ID of the group to fetch.
 * @returns {Promise<Group>} - The group data.
 */
export const fetchGroupById = async (id: string): Promise<Group> => {
  try {
    const response: AxiosResponse<Group> = await apiClient.get(
      `/groups/${id}/`
    );
    console.log(`Fetch group ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching group ${id}:`, error);
    throw error;
  }
};

/**
 * Mock API call to post an announcement in a group.
 * @param {string} id - The ID of the group.
 * @param {object} announcementData - Data for the announcement (e.g., { title, content }).
 * @returns {Promise<Announcement>} - The announcement data.
 */
export const postGroupAnnouncement = async (
  id: string,
  announcementData: { title: string; content: string }
): Promise<Announcement> => {
  try {
    const response: AxiosResponse<Announcement> = await apiClient.post(
      `/groups/${id}/announce/`,
      announcementData
    );
    console.log(`Post announcement in group ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error posting announcement in group ${id}:`, error);
    throw error;
  }
};

// --- Admin Endpoints ---

/**
 * Mock API call to fetch the admin dashboard data.
 * @returns {Promise<AdminDashboardData>} - Admin dashboard data.
 */
export const fetchAdminDashboard = async (): Promise<AdminDashboardData> => {
  try {
    const response: AxiosResponse<AdminDashboardData> = await apiClient.get(
      "/admin/dashboard/"
    );
    console.log("Fetch admin dashboard response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

/**
 * Mock API call to ban a user as an admin.
 * @param {string} id - The ID of the user to ban.
 * @returns {Promise<User>} - The updated user data.
 */
export const banUserAsAdmin = async (id: string): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await apiClient.patch(
      `/admin/user/${id}/ban/`
    );
    console.log(`Ban user ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error banning user ${id}:`, error);
    throw error;
  }
};

/**
 * Mock API call to reset the wallet of a user as an admin.
 * @param {string} id - The ID of the user whose wallet to reset.
 * @returns {Promise<WalletBalanceResponse>} - The updated wallet data.
 */
export const resetUserWalletAsAdmin = async (
  id: string
): Promise<WalletBalanceResponse> => {
  try {
    // Assuming the endpoint takes the user ID in the body
    const response: AxiosResponse<WalletBalanceResponse> = await apiClient.post(
      "/admin/wallet/reset/",
      { user_id: id }
    );
    console.log(`Reset wallet for user ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error resetting wallet for user ${id}:`, error);
    throw error;
  }
};

// Re-export the original fetchUsers and createUser for completeness
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<User[]> = await apiClient.get("/users");
    console.log("Fetch all users response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (userData: {
  name: string;
  email: string;
}): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await apiClient.post(
      "/users",
      userData
    );
    console.log("Create user response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw error;
  }
};
