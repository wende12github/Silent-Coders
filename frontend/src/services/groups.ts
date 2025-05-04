import { LeaderboardEntry } from "../store/types";
import { apiClient, PaginatedResponse } from "./api";
import axios, { AxiosResponse } from "axios";

export interface Group {
  id: number;
  name: string;
  description: string;
  owner: number;
  created_at: string;
  members: {
    email: string;
    name: string;
  }[];
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  owner: number;
  created_at: string;
  members: {
    email: string;
    name: string;
  }[];
}

export interface GroupListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Omit<GroupResponse, "members">[] | GroupResponse[];
}

export const createGroup = async (
  groupData: CreateGroupRequest
): Promise<GroupResponse> => {
  try {
    const response = await apiClient.post<GroupResponse>("/groups/", groupData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data);
      throw new Error(serverMessage || "Failed to create group");
    }
    throw new Error("Network error - could not connect to server");
  }
};

export const fetchMyGroups = async (
  page?: number,
  search?: string
): Promise<Omit<GroupResponse, "members">[]> => {
  try {
    const params = page
      ? search
        ? { page, search }
        : { page }
      : search
      ? { search }
      : {};
    const response = await apiClient.get<PaginatedResponse<GroupResponse>>(
      "groups/my-groups",
      { params }
    );
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          `Failed to fetch groups (Status: ${error.response?.status})`
      );
    }
    console.error("Non-Axios Error:", error);
    throw new Error("Network error while fetching groups");
  }
};

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

export const joinGroup = async (id: string): Promise<void> => {
  try {
    const response: AxiosResponse<Group> = await apiClient.post(
      `/groups/${id}/join`
    );
    console.log(`Join group ${id} response:`, response.data);
  } catch (error: any) {
    console.error(`Error joining group ${id}:`, error);
    throw error;
  }
};

export const getGroupLeaderboard = async (
  groupId: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  try {
    const response = await apiClient.get(`/groups/${groupId}/leaderboard/`, {
      params: {
        limit,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching group leaderboard:", error);
    throw error;
  }
};

export interface AllGroups {
  id: number;
  name: string;
  description: string;
  owner: string;
  member_count: number;
  created_at: string;
}

export const fetchAllGroups = async (
  search?: string,
  page: number = 1
): Promise<AllGroups[]> => {
  try {
    const response = await apiClient.get("/groups/", {
      params: {
        search,
        page,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};
