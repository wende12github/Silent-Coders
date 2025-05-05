import { LeaderboardEntry } from "../store/types";
import { apiClient } from "./api";
import axios, { AxiosResponse } from "axios";
import { fetchUser } from "./user";
import { User } from "../store/types";

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
    const response = await apiClient.post<GroupResponse>("/groups/create/", groupData);
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
  search?: string,
  page: number = 1
): Promise<AllGroups[]> => {
  try {
    const response = await apiClient.get("/groups/my-groups/", {
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

export const joinGroup = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      `/groups/${id}/join/`,
      { id: Number(id) }
    );
    return response.data;
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


interface SendMessageRequest {
  is_group_chat: boolean;
  message: string;
  room_name: string;
}

export interface ChatbotResponse {
  user: number;
  room: number;
  message: string;
  message_tyep: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSending?: boolean;
  status?: 'sending' | 'delivered' | 'failed';
  error?: string;
}

export const sendGroupMessage = async (
  messageData: SendMessageRequest
): Promise<ChatbotResponse> => {
  try {
    const response = await apiClient.post<ChatbotResponse>("/chatbot/sendMessage/", messageData);
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

export const fetchGroupMessages = async (groupName: string): Promise<ChatMessage[]> => {
  try {
    // 1. Fetch messages
    const response = await apiClient.get(`/chatbot/group/${groupName}/`);
    
    // 2. Process each message
    const messages = await Promise.all(
      response.data.map(async (msg: any) => {
        // 3. Get user details for each message
        const user = await fetchUser(msg.user);
        
        return {
          id: `${msg.user}-${msg.created_at}`,
          senderId: msg.user,
          senderName: user.username, // Now using actual username
          senderAvatar: user.profile_picture || `https://placehold.co/100x100?text=${user.username.charAt(0)}`,
          text: msg.message,
          timestamp: msg.created_at,
          status: 'delivered' as const,
        };
      })
    );
    
    return messages;
  } catch (error) {
    console.error(`Error fetching messages:`, error);
    throw error;
  }
};