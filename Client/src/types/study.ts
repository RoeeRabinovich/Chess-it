// Study types for public studies

export type GameAspect = "All" | "Opening" | "Endgame" | "Strategy" | "Tactics";
export type StudyFilters = "All" | "New" | "Popular";

export interface PublicStudy {
  _id: string;
  studyName: string;
  category: "Opening" | "Endgame" | "Strategy" | "Tactics";
  description: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  } | null;
  likes: number;
  gameState: {
    position: string; // FEN position
  };
}

export interface GetPublicStudiesParams {
  category?: GameAspect;
  filter?: StudyFilters;
  search?: string;
  limit?: number;
  skip?: number;
}
