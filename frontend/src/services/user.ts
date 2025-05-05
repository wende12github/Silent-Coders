import { User } from "../store/types";
import { apiClient } from "./api";

const getUser = async (userId: number): Promise<User> => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};
export async function fetchUser(userId: number) {
  const userData = await getUser(userId);
  return userData;
}

export const updateCurrentUser = async (user: Partial<User>) => {
  const response = await apiClient.put(`/users/${user.id}`, user);
  return response.data;
};

export const fetchMe = async (): Promise<User> => {
  try {
    const response = await apiClient.get("/auth/me/");
    console.log("Fetch current user response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};
