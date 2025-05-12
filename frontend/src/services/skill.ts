import { AxiosError } from "axios";
import { Skill, PaginatedResponse, Tag } from "../store/types";
import { apiClient } from "./api";

export interface CreateSkillPayload {
  name: string;
  description?: string;
  is_offered?: boolean;
  location: "local" | "remote";
  address?: string | null;
  tags?: string[] | any;
  is_visible?: boolean;
  level?: "Beginner" | "Intermediate" | "Expert";
}

export interface UpdateSkillPayload {
  name?: string;
  description?: string;
  is_offered?: boolean;
  location?: "local" | "remote";
  address?: string | null;
  tags?: string[] | any;
  is_visible?: boolean;
}

/**
 * Fetches a list of skills with optional search and filters.
 * Backend uses SkillListCreateView at /skills/.
 * @param params Optional query parameters for search, tags, user_id, is_offered, pagination.
 * @returns A promise resolving to a PaginatedResponse containing an array of Skill objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchSkills = async (params?: {
  search?: string | null;
  tags?: string | string[] | null;
  user_id?: number | null;
  is_offered?: boolean | null;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Skill>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Skill>>("/skills/", {
      params: {
        ...params,

        tags: Array.isArray(params?.tags)
          ? params?.tags.join(",")
          : params?.tags,
      },
    });
    console.log("Fetched skills:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error as AxiosError;
  }
};

/**
 * Creates a new skill for the authenticated user.
 * Backend uses SkillListCreateView (POST) at /skills/.
 * @param skillData The payload for the new skill.
 * @returns A promise resolving to the created Skill object.
 * @throws AxiosError if the API call fails.
 */
export const createSkill = async (
  skillData: CreateSkillPayload
): Promise<Skill> => {
  try {
    const response = await apiClient.post<Skill>("/skills/", skillData);
    console.log("Created skill:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating skill:", skillData, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches details of a specific skill by ID.
 * Backend uses SkillDetailView at /skills/{pk}/.
 * @param skillId The ID of the skill to fetch.
 * @returns A promise resolving to a Skill object.
 * @throws AxiosError if the API call fails (e.g., 404 if not found/visible).
 */
export const fetchSkillById = async (skillId: number): Promise<Skill> => {
  try {
    const response = await apiClient.get<Skill>(`/skills/${skillId}/`);
    console.log(`Fetched skill ${skillId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching skill ${skillId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Updates details of a specific skill. Only the owner can update.
 * Backend uses SkillDetailView (PUT/PATCH) at /skills/{pk}/.
 * @param skillId The ID of the skill to update.
 * @param updateData The payload with fields to update.
 * @returns A promise resolving to the updated Skill object.
 * @throws AxiosError if the API call fails.
 */
export const updateSkill = async (
  skillId: number,
  updateData: UpdateSkillPayload
): Promise<Skill> => {
  try {
    const response = await apiClient.patch<Skill>(
      `/skills/${skillId}/`,
      updateData
    );
    console.log(`Updated skill ${skillId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating skill ${skillId}:`, updateData, error);
    throw error as AxiosError;
  }
};

/**
 * Deletes a specific skill. Only the owner can delete.
 * Backend uses SkillDetailView (DELETE) at /skills/{pk}/.
 * @param skillId The ID of the skill to delete.
 * @returns A promise resolving when the deletion is successful.
 * @throws AxiosError if the API call fails.
 */
export const deleteSkill = async (skillId: number): Promise<void> => {
  try {
    await apiClient.delete(`/skills/${skillId}/`);
    console.log(`Deleted skill ${skillId}`);
  } catch (error) {
    console.error(`Error deleting skill ${skillId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Endorses a specific skill. Authenticated users can endorse a skill only once.
 * Backend uses EndorseSkillView (POST) at /skills/{pk}/endorse/.
 * @param skillId The ID of the skill to endorse.
 * @returns A promise resolving to the updated Skill object.
 * @throws AxiosError if the API call fails.
 */
export const endorseSkill = async (skillId: number): Promise<Skill> => {
  try {
    const response = await apiClient.post<Skill>(`/skills/${skillId}/endorse/`);
    console.log(`Endorsed skill ${skillId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error endorsing skill ${skillId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches a list of skills offered by the authenticated user.
 * Backend uses MySkillsListView at /skills/my/.
 * @returns A promise resolving to a PaginatedResponse containing an array of Skill objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchMySkills = async (): Promise<PaginatedResponse<Skill>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Skill>>(
      "/skills/my/"
    );
    console.log("Fetched my skills:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching my skills:", error);
    throw error as AxiosError;
  }
};

export const fetchAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await apiClient.get("/bookings/tags/");
    console.log("Fetched all tags:", response.data.results);
    return response.data.results as Tag[];
  } catch (error) {
    throw error as AxiosError;
  }
};
