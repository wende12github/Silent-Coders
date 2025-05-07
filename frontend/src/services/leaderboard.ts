import { apiClient } from "./api";
import { PaginatedResponse } from "./api";
import { LeaderboardEntry } from "../store/types";

export const fetchLeaderboard = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<LeaderboardEntry>> => {
  const response = await apiClient.get("/leaderboard/", {
    params: { page, limit },
  });
  return response.data;
};

export const fetchUserLeaderboard = async (userId: number) => {
  const response = await apiClient.get(`/leaderboard/${userId}/`);
  return response.data;
};
