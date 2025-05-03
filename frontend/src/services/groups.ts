import { apiClient } from "./api";
import axios, { AxiosResponse } from "axios";

export interface Group {
  id: number;
  name: string;
  description: string;
  owner: number;
  created_at: string;
  members: string;
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
}

export interface GroupListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GroupResponse[];
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
): Promise<GroupListResponse> => {
  try {
    const params = page
      ? search
        ? { page, search }
        : { page }
      : search
      ? { search }
      : {};
    const response = await apiClient.get<GroupListResponse>(
      "groups/my-groups",
      { params }
    );
    return response.data;
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

export const joinGroup = async (id: string): Promise<Group> => {
  try {
    const response: AxiosResponse<Group> = await apiClient.post(
      `/groups/${id}/join`
    );
    console.log(`Join group ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error joining group ${id}:`, error);
    throw error;
  }
};
