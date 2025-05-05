import { AxiosResponse } from "axios";
import { apiClient, PaginatedResponse } from "./api";
import { Skill } from "../store/types";

export interface FetchSkillsParams {
  searchTerm?: string | null;
  page?: number | null;
  type?: "request" | "offer" | null;
}

/**
 * Fetch skills with optional filters for type, search, and pagination.
 * @param params - Filtering options.
 * @returns {Promise<Skill[]>}
 */

export const fetchSkills = async ({
  searchTerm = null,
  page = 1,
  type = null,
}: FetchSkillsParams): Promise<Skill[]> => {
  try {
    let endpoint = "/skills/";
    if (type === "request") {
      endpoint = "/skills/requested/";
    } else if (type === "offer") {
      endpoint = "/skills/offered/";
    }

    const response = await apiClient.get<PaginatedResponse<Skill>>(endpoint, {
      params: {
        q: searchTerm || undefined,
        page: page || undefined,
      },
    });

    return response.data.results;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

export const createSkill = async (
  skillData: Omit<Skill, "id" | "user">
): Promise<Skill> => {
  try {
    const response = await apiClient.post(
      "/skills/",
      skillData
    );
    const data = response.data;
    return data as Skill;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

export const deleteSkill = async (skillId: number): Promise<void> => {
  try {
    await apiClient.delete(`/skills/${skillId}/`);
    console.log(`Skill with ID ${skillId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting skill with ID ${skillId}:`, error);
    throw error;
  }
};

export const updateSkill = async (
  skillId: number,
  skillData: Partial<Omit<Skill, "id" | "user">>
): Promise<Skill> => {
  try {
    const response: AxiosResponse<Skill> = await apiClient.put(
      `/skills/${skillId}/`,
      skillData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating skill with ID ${skillId}:`, error);
    throw error;
  }
};

export const fetchSkill = async (skillId: number): Promise<Skill> => {
  try {
    const response: AxiosResponse<Skill> = await apiClient.get(
      `/skills/${skillId}/`
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching skill request:", error);
    throw error;
  }
};

export const fetchMySkills = async (): Promise<Skill[]> => {
  try {
    const response: AxiosResponse<PaginatedResponse<Skill>> = await apiClient.get("/skills/me/");
    return response.data.results;
  } catch (error) {
    console.error("Error fetching my skills:", error);
    throw error;
  }
};


export const fetchAllSkills = async (): Promise<Skill[]> => {
  try {
    const response: AxiosResponse<PaginatedResponse<Skill>> = await apiClient.get("/skills/");
    console.log("Fetch all skills response:", response.data);
    return response.data.results;
  } catch (error: any) {
    console.error("Error fetching all skills:", error);
    throw error;
  }
};
