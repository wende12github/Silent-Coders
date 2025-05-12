import {
  PrivateChatMessage,
  SendMessagePayload,
  PrivateConversation,
  ChatMessage as GroupChatMessage,
} from "../store/types";
import { apiClient } from "./api";

/**
 * Fetches historical messages for a specific group chat.
 * **Now uses group ID instead of group name.**
 * @param groupId The ID of the group (number).
 * @param offset Number of messages to skip (for pagination).
 * @param limit Number of messages to return (for pagination).
 * @returns Promise resolving to an array of ChatMessage objects (API type).
 */
export const getGroupMessages = async (
  groupId: number,
  offset: number = 0,
  limit: number = 50
): Promise<GroupChatMessage[]> => {
  try {
    const response = await apiClient.get(`/messages/group/${groupId}/`, {
      params: { offset, limit },
    });

    console.log(response.data);
    return response.data as GroupChatMessage[];
  } catch (error) {
    console.error(`Error fetching group messages for ID "${groupId}":`, error);
    throw error;
  }
};

/**
 * Fetches historical messages for a private chat with a specific user.
 * @param userId The ID of the other user in the private conversation.
 * @param offset Number of messages to skip (for pagination).
 * @param limit Number of messages to return (for pagination).
 * @returns A Promise resolving to an array of PrivateChatMessage objects.
 */
export const getPrivateMessages = async (
  userId: number,
  offset: number = 0,
  limit: number = 50
): Promise<PrivateChatMessage[]> => {
  try {
    const response = await apiClient.get(`/messages/private/${userId}/`, {
      params: { offset, limit },
    });

    return response.data as PrivateChatMessage[];
  } catch (error) {
    console.error(
      `Error fetching private messages with user ID "${userId}":`,
      error
    );
    throw error;
  }
};

/**
 * Sends a new message (either group or private) via the REST API.
 * Note: For real-time chat, WebSocket is typically used for sending/receiving.
 * This API endpoint is an alternative for sending or perhaps for specific use cases.
 * @param payload The message data (message, type, target).
 * @returns A Promise resolving to the created message object (ChatMessage or PrivateChatMessage).
 */
export const sendMessage = async (
  payload: SendMessagePayload
): Promise<GroupChatMessage | PrivateChatMessage> => {
  try {
    if (!payload.message) {
      console.error("Attempted to send empty message payload.");
      throw new Error("Message content is required.");
    }
    if (payload.is_group_chat && !payload.group_id) {
      console.error("Attempted to send group message without room_id.");
      throw new Error("Room name is required for group chat.");
    }
    if (
      !payload.is_group_chat &&
      (payload.other_user_id === undefined || payload.other_user_id === null)
    ) {
      console.error("Attempted to send private message without other_user_id.");
      throw new Error("Receiver user ID is required for private chat.");
    }

    const response = await apiClient.post("/messages/send/", payload);

    if (payload.is_group_chat) {
      return response.data as GroupChatMessage;
    } else {
      return response.data as PrivateChatMessage;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Fetches a summary list of all private conversations for the authenticated user.
 * Includes the conversation partner, last message details, and unread count.
 * @returns A Promise resolving to an array of PrivateConversation objects.
 */
export const getPrivateConversations = async (): Promise<
  PrivateConversation[]
> => {
  try {
    const response = await apiClient.get("/messages/private/");

    return response.data as PrivateConversation[];
  } catch (error) {
    console.error("Error fetching private conversations:", error);
    throw error;
  }
};
