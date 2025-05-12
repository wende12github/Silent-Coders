import { AxiosError } from "axios";
import {
  CreateGroupRequest,
  GroupListItem,
  PaginatedResponse,
  GroupDetail,
  UpdateGroupRequest,
  LeaderboardEntry,
  GroupAnnouncement,
  SendAnnouncementRequest,
} from "../store/types";
import { apiClient } from "./api";

interface FetchGroupsParams {
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * Creates a new group.
 * Backend uses GroupCreateView (POST).
 * @param groupData The payload for the new group (including image file).
 * @returns A promise resolving to the created GroupDetail object (or GroupListItem if serializer differs).
 * @throws AxiosError if the API call fails.
 */
export const createGroup = async (
  groupData: CreateGroupRequest
): Promise<GroupDetail | GroupListItem> => {
  try {
    const formData = new FormData();
    formData.append("name", groupData.name);
    formData.append("description", groupData.description);
    if (groupData.image) {
      formData.append("image", groupData.image);
    }

    const response = await apiClient.post<GroupDetail | GroupListItem>(
      "/groups/create/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("Created group:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", groupData, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches a list of groups the authenticated user is a member of.
 * Backend uses MyGroupsListView at /groups/my/.
 * @param params Optional query parameters for search and pagination.
 * @returns A promise resolving to a PaginatedResponse containing an array of GroupListItem objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchMyGroups = async (
  params?: FetchGroupsParams
): Promise<PaginatedResponse<GroupListItem>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<GroupListItem>>(
      "/groups/my/",
      {
        params: params,
      }
    );
    console.log("Fetch my groups response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching my groups:", error);
    throw error as AxiosError;
  }
};

/**
 * Fetches a list of all groups (publicly accessible).
 * Backend uses GroupListCreateView at /groups/.
 * @param params Optional query parameters for search and pagination.
 * @returns A promise resolving to a PaginatedResponse containing an array of GroupListItem objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchAllGroups = async (
  params?: FetchGroupsParams
): Promise<PaginatedResponse<GroupListItem>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<GroupListItem>>(
      "/groups/",
      {
        params: params,
      }
    );
    console.log("Fetch all groups response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all groups:", error);
    throw error as AxiosError;
  }
};

/**
 * Joins a specific group.
 * Backend uses JoinGroupView (POST) at /groups/{pk}/join/.
 * @param groupId The ID of the group to join.
 * @returns A promise resolving when the join is successful (backend might return status or GroupDetail).
 * @throws AxiosError if the API call fails (e.g., already a member, group not found).
 */
export const joinGroup = async (groupId: number): Promise<void> => {
  try {
    await apiClient.post(`/groups/${groupId}/join/`);
    console.log(`Joined group ${groupId}`);
  } catch (error) {
    console.error(`Error joining group ${groupId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches details of a specific group.
 * Backend uses GroupDetailView at /groups/{pk}/.
 * @param groupId The ID of the group to fetch.
 * @returns A promise resolving to a GroupDetail object.
 * @throws AxiosError if the API call fails.
 */
export const fetchGroupDetail = async (
  groupId: number
): Promise<GroupDetail> => {
  try {
    const response = await apiClient.get<GroupDetail>(`/groups/${groupId}/`);
    console.log(`Fetched group ${groupId} details:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching group ${groupId} details:`, error);
    throw error as AxiosError;
  }
};

/**
 * Updates details of a specific group. Only the group owner can update.
 * Backend uses GroupDetailView (PUT/PATCH) at /groups/{pk}/.
 * @param groupId The ID of the group to update.
 * @param updateData The payload with fields to update.
 * @returns A promise resolving to the updated GroupDetail object.
 * @throws AxiosError if the API call fails.
 */
export const updateGroup = async (
  groupId: number,
  updateData: UpdateGroupRequest
): Promise<GroupDetail> => {
  try {
    const formData = new FormData();

    if (updateData.name !== undefined) {
      formData.append("name", updateData.name);
    }
    if (updateData.description !== undefined) {
      formData.append("description", updateData.description);
    }

    if (updateData.image !== undefined) {
      if (updateData.image === null) {
        formData.append("image", "");
      } else {
        formData.append("image", updateData.image);
      }
    }

    const response = await apiClient.patch<GroupDetail>(
      `/groups/${groupId}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(`Updated group ${groupId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating group ${groupId}:`, updateData, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches members of a specific group.
 * Backend might have a separate endpoint like /groups/{pk}/members/.
 * @param groupId The ID of the group to fetch members for.
 * @returns A promise resolving to an array of GroupMember objects.
 * @throws AxiosError if the API call fails.
 */

/**
 * Fetches the leaderboard for a specific group. User must be an active member.
 * Backend uses GroupLeaderboardSerializer and pagination (though ViewSet handles top_n manually).
 * @param groupId The ID of the group.
 * @param top Optional number of top members to return.
 * @param sortBy Optional field to sort by ('given', 'received', 'sessions', 'net').
 * @returns A promise resolving to an array of LeaderboardEntry objects.
 * @throws AxiosError if the API call fails.
 */
export const getGroupLeaderboard = async (
  groupId: number,
  top: number = 10,
  sortBy: "given" | "received" | "sessions" | "net" = "given"
): Promise<LeaderboardEntry[]> => {
  try {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `/groups/${groupId}/leaderboard/`,
      {
        params: {
          top: top,
          sort_by: sortBy,
        },
      }
    );
    console.log(`Fetch group ${groupId} leaderboard response:`, response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching group leaderboard:", error);
    throw error as AxiosError;
  }
};

/**
 * Sends an announcement to a specific group. Only the group owner can post.
 * Backend uses /announcements/ endpoint with POST.
 * @param groupId The ID of the group to post the announcement to.
 * @param messageData The payload for the announcement (title, message).
 * @returns A promise resolving to the created GroupAnnouncement object.
 * @throws AxiosError if the API call fails.
 */
export const sendAnnouncement = async (
  groupId: number,
  messageData: SendAnnouncementRequest
): Promise<GroupAnnouncement> => {
  try {
    const response = await apiClient.post<GroupAnnouncement>(
      `/groups/${groupId}/announcements/`,
      messageData
    );
    console.log(`Sent announcement to group ${groupId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to send announcement to group ${groupId}:`,
      messageData,
      error
    );
    throw error as AxiosError;
  }
};

/**
 * Fetches announcements for a specific group. User must be an active member.
 * Backend uses /announcements/ endpoint with GET and pagination.
 * @param groupId The ID of the group.
 * @param search Optional search query (if backend supports it).
 * @param page Page number for pagination.
 * @returns A promise resolving to an array of GroupAnnouncement objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchAnnouncements = async (
  groupId: number,
  search?: string,
  page: number = 1
): Promise<GroupAnnouncement[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<GroupAnnouncement>>(
      `/groups/${groupId}/announcements/`,
      {
        params: {
          search,
          page,
        },
      }
    );
    console.log(
      `Fetched announcements for group ${groupId}:`,
      response.data.results
    );
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching announcements for group ${groupId}:`, error);
    throw error as AxiosError;
  }
};
