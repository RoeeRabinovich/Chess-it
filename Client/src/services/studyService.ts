import { ChessGameState } from "../types/chess";
import { GetPublicStudiesParams, Study } from "../types/study";
import { apiClient } from "./api";

// Study service class
class StudyService {
  // Create a new study
  async createStudy(data: {
    studyName: string;
    category: "Opening" | "Endgame" | "Strategy" | "Tactics";
    description?: string;
    isPublic: boolean;
    gameState: Omit<ChessGameState, "comments" | "startingPosition"> & {
      comments?: Map<string, string> | Record<string, string>;
    };
  }): Promise<{ id: string; studyName: string }> {
    // Convert comments Map to plain object for JSON serialization
    // Handle both Map and plain object cases
    const commentsObject: Record<string, string> = {};
    if (data.gameState.comments) {
      if (data.gameState.comments instanceof Map) {
        data.gameState.comments.forEach((value, key) => {
          commentsObject[key] = value;
        });
      } else if (typeof data.gameState.comments === "object") {
        // Already an object, just copy it
        Object.assign(commentsObject, data.gameState.comments);
      }
    }

    const payload = {
      studyName: data.studyName,
      category: data.category,
      description: data.description || "",
      isPublic: data.isPublic,
      gameState: {
        ...data.gameState,
        comments: commentsObject,
      },
    };

    const response = await apiClient.post<{ id: string; studyName: string }>(
      "/studies/create",
      payload,
    );
    return response.data;
  }

  // Get public studies with filters
  async getPublicStudies(
    params: GetPublicStudiesParams = {},
  ): Promise<Study[]> {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append("category", params.category);
    if (params.filter) queryParams.append("filter", params.filter);
    if (params.search) queryParams.append("search", params.search);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.skip) queryParams.append("skip", params.skip.toString());
    if (params.likedOnly) queryParams.append("likedOnly", "true");

    const response = await apiClient.get<Study[]>(
      `/studies/public?${queryParams.toString()}`,
    );
    return response.data;
  }

  // Get user's own studies
  async getUserStudies(): Promise<Study[]> {
    const response = await apiClient.get<Study[]>("/studies/my-studies");
    return response.data;
  }

  // Get study by ID
  // Returns full study with complete gameState including moves, branches, comments
  async getStudyById(studyId: string): Promise<Study> {
    const response = await apiClient.get<Study>(`/studies/${studyId}`);
    return response.data;
  }

  // Like a study
  async likeStudy(studyId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      `/studies/${studyId}/like`,
    );
    return response.data;
  }

  // Unlike a study
  async unlikeStudy(studyId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/studies/${studyId}/like`,
    );
    return response.data;
  }

  // Get user's liked study IDs
  async getLikedStudyIds(): Promise<string[]> {
    const response = await apiClient.get<string[]>("/studies/liked/ids");
    return response.data;
  }

  // Update a study
  async updateStudy(
    studyId: string,
    data: {
      studyName: string;
      description?: string;
      isPublic: boolean;
    },
  ): Promise<Study> {
    const response = await apiClient.put<Study>(`/studies/${studyId}`, data);
    return response.data;
  }

  // Delete a study
  async deleteStudy(studyId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/studies/${studyId}`,
    );
    return response.data;
  }
}

// Export singleton instance
export const studyService = new StudyService();
export default studyService;
