import { Study } from "../types/study";
import { apiClient } from "./api";

// Admin study service class
class AdminStudyService {
  // Get all studies with pagination, search, and filters
  async getAllStudies(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    isPublic?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    dateFilter?: string;
  }): Promise<{
    studies: Study[];
    totalStudies: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
  }> {
    const response = await apiClient.get<{
      studies: Study[];
      totalStudies: number;
      currentPage: number;
      totalPages: number;
      pageSize: number;
    }>("/admin/studies", { params });
    return response.data;
  }

  // Update study metadata (name, category, description, isPublic)
  async updateStudyMetadata(
    studyId: string,
    data: {
      studyName?: string;
      category?: "Opening" | "Endgame" | "Strategy" | "Tactics";
      description?: string;
      isPublic?: boolean;
    },
  ): Promise<Study> {
    const response = await apiClient.patch<Study>(
      `/admin/studies/${studyId}`,
      data,
    );
    return response.data;
  }

  // Delete study
  async deleteStudy(studyId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/admin/studies/${studyId}`,
    );
    return response.data;
  }
}

// Export singleton instance
export const adminStudyService = new AdminStudyService();
export default adminStudyService;
