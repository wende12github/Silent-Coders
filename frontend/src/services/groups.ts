import axios, { AxiosInstance, AxiosResponse } from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useAuthStore } from "../store/authStore";

export interface Group {
    id: number;
    name: string;
    description: string;
    owner: number;
    created_at: string;
    members: string;
}

// Interface for Creating a Group
export interface CreateGroupRequest {
    name: string;
    description: string;
}

// Interface for Create Group Response
export interface GroupResponse {
    id: number;
    name: string;
    description: string;
    owner: number;
    created_at: string;
}

// Interface for Fetching My Groups
export interface GroupListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: GroupResponse[];
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
  

export const createGroup = async (groupData: CreateGroupRequest): Promise<GroupResponse> => {
  try {
    const response = await apiClient.post<GroupResponse>('/groups/', groupData); // Note: changed from '/group/' to '/groups/'
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Improved error message extraction
      const serverMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          JSON.stringify(error.response?.data);
      throw new Error(serverMessage || 'Failed to create group');
    }
    throw new Error('Network error - could not connect to server');
  }
};

export const fetchMyGroups = async (page?: number): Promise<GroupListResponse> => {
    try {
      const params = page ? { page } : {};
      const response = await apiClient.get<GroupListResponse>('groups/my-groups', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.detail || 
          `Failed to fetch groups (Status: ${error.response?.status})`
        );
      }
      console.error('Non-Axios Error:', error);
      throw new Error('Network error while fetching groups');
    }
  };

  export const fetchGroupById = async (id: number): Promise<Group> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch group: ${response.statusText}`);
    }
    
    return response.json();
  };
  
    // You can add other group-related API calls here
    // For example: getGroups, updateGroup, deleteGroup, etc.

/**
 * Mock API call to fetch a specific group by ID.
 * @param {string} id - The ID of the group to fetch.
 * @returns {Promise<Group>} - The group data.
 */
// export const fetchGroupById = async (id: string): Promise<Group> => {
//   try {
//     const response: AxiosResponse<Group> = await apiClient.get(
//       `/groups/${id}/`
//     );
//     console.log(`Fetch group ${id} response:`, response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error(`Error fetching group ${id}:`, error);
//     throw error;
//   }
// };

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