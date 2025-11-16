// Study types for public studies

import { ChessGameState } from "./chess";

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

/**
 * Full study object with complete gameState (used for reviewing a study)
 * This includes all moves, branches, comments, etc.
 */
export interface Study {
  _id: string;
  studyName: string;
  category: "Opening" | "Endgame" | "Strategy" | "Tactics";
  description: string;
  isPublic: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
  } | null;
  gameState: {
    position: string;
    moves: ChessGameState["moves"];
    branches: ChessGameState["branches"];
    currentMoveIndex: number;
    isFlipped: boolean;
    opening?: ChessGameState["opening"];
    comments?: Record<string, string>; // Plain object from backend (will be converted to Map)
  };
}
