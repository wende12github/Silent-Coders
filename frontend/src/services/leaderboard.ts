import {apiClient} from "./api";
import { PaginatedResponse } from "./api"; // ✅ important!
import { LeaderboardEntry } from "../store/types";

// ✅ Updated fetchLeaderboard with pagination
export const fetchLeaderboard = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<LeaderboardEntry>> => {
  const response = await apiClient.get("/leaderboard/", {
    params: { page, limit },
  });
  return response.data;
};

// ✅ Keep this if you're using it to fetch the current user's rank or data
export const fetchUserLeaderboard = async (userId: number) => {
  const response = await apiClient.get(`/leaderboard/user/${userId}/`);
  return response.data;
};
