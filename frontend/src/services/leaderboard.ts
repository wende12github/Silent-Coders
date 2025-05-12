import { AxiosError } from "axios";
import {
  LeaderboardEntry,
  GlobalLeaderboardSortBy,
  PaginatedResponse,
} from "../store/types";
import { apiClient } from "./api";

/**
 * Fetches the global user leaderboard with pagination.
 * Backend uses LeaderboardViewSet at /leaderboard/.
 * @param page The page number to fetch. Defaults to 1.
 * @param pageSize The number of items per page. Defaults to 10.
 * @param sortBy Optional field to sort by ('given', 'received', 'sessions', or 'net'). Defaults to 'given'.
 * @returns A promise resolving to a PaginatedResponse containing an array of LeaderboardEntry objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchGlobalLeaderboard = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: GlobalLeaderboardSortBy = "given"
): Promise<PaginatedResponse<LeaderboardEntry>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<LeaderboardEntry>>(
      "/leaderboard/",
      {
        params: {
          page: page,
          page_size: pageSize,
          sort_by: sortBy,
        },
      }
    );
    console.log("Fetched global leaderboard (paginated):", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    throw error as AxiosError;
  }
};

/**
 * Fetches a single user's global stats by user ID.
 * Backend uses LeaderboardViewSet retrieve method at /leaderboard/{pk}/.
 * @param userId The ID of the user whose stats to fetch.
 * @returns A promise resolving to a single LeaderboardEntry object.
 * @throws AxiosError if the API call fails (e.g., 404 if user stats not found).
 */
export const fetchUserGlobalStats = async (
  userId: number
): Promise<LeaderboardEntry> => {
  try {
    const response = await apiClient.get<LeaderboardEntry>(
      `/leaderboard/${userId}/`
    );
    console.log(`Fetched global stats for user ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching global stats for user ${userId}:`, error);
    throw error as AxiosError;
  }
};
