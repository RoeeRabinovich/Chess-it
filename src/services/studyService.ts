import { StudyData } from "../types/StudyData";
import { mockApi } from "./mockApi";

export const studyService = {
  getPublicStudies: () => mockApi.studies.getPublic(),
  getStudyById: (id: string) => mockApi.studies.getById(id),
  createStudy: (data: StudyData) => mockApi.studies.create(data),
  getComments: (studyId: string) => mockApi.comments.getByStudyId(studyId),
  createComment: (studyId: string, content: string) =>
    mockApi.comments.create(studyId, content),
  toggleFavorite: (studyId: string) => mockApi.favorites.toggle(studyId),
  checkFavorite: (studyId: string) => mockApi.favorites.check(studyId),
};
