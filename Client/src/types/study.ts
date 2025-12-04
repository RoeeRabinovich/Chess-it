import { ChessGameState } from "./chess";

export type GameAspect = "All" | "Opening" | "Endgame" | "Strategy" | "Tactics";
export type StudyFilters = "All" | "New" | "Popular";

export interface GetPublicStudiesParams {
  category?: GameAspect;
  filter?: StudyFilters;
  search?: string;
  limit?: number;
  skip?: number;
  likedOnly?: boolean;
}

/**
 * Study object - can be used for both list views and full study review
 * For list views, gameState only contains position
 * For full study review, gameState contains complete moveTree and currentPath
 */
export interface Study extends Record<string, unknown> {
  _id: string;
  studyName: string;
  category: "Opening" | "Endgame" | "Strategy" | "Tactics";
  description: string;
  isPublic?: boolean; // Optional - present in user studies, not in public listings
  likes: number;
  createdAt: string;
  updatedAt?: string; // Optional - may not be present in list views
  createdBy: {
    _id: string;
    username: string;
  } | null;
  gameState: {
    position: string;
    // For list views, only position is present
    // For full study review, all fields are present
    moveTree?: ChessGameState["moveTree"];
    rootBranches?: ChessGameState["rootBranches"];
    startingPosition?: string;
    currentPath?: ChessGameState["currentPath"];
    isFlipped?: boolean;
    opening?: ChessGameState["opening"];
    comments?: Record<string, string>; // Plain object from backend (will be converted to Map)
  };
}
