import { LeaderboardEntry } from "../store/types";
import { apiClient } from "./api";

export const fetchLeaderboard = async (
  page: number = 1,
  limit: number = 10
) => {
  const response = await apiClient.get("/leaderboard/", {
    params: {
      page: page,
      limit: limit,
    },
  });
  return response.data.results;
};

export const fetchUserLeaderboard = async (
  userId: number
): Promise<LeaderboardEntry> => {
  const response = await apiClient.get(`/leaderboard/${userId}/`);
  return response.data;
};
