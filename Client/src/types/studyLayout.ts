import { ChessGameState, MovePath } from "./chess";

export interface StudyLayoutProps {
  // Game state
  gameState: ChessGameState;
  currentPath: MovePath;
  makeMove: (move: import("./chess").ChessMove) => boolean;
  onMoveClick: (path: MovePath) => void;

  // Engine state
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  formattedEngineLines: Array<{
    sanNotation: string;
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  displayEvaluation: {
    evaluation: number;
    possibleMate: string | null;
  };

  // Controls
  onFlipBoard: () => void;
  onUndo: () => void;
  onReset: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  canUndo: boolean;
  canGoToPreviousMove: boolean;
  canGoToNextMove: boolean;
  onPreviousMove: () => void;
  onNextMove: () => void;

  // Settings
  isEngineEnabledForSettings: boolean;
  onEngineToggle: (enabled: boolean) => void;
  engineLinesCount: number;
  onEngineLinesCountChange: (count: number) => void;
  engineDepth: number;
  onEngineDepthChange: (depth: number) => void;
  analysisMode: "quick" | "deep";
  onAnalysisModeChange: (mode: "quick" | "deep") => void;
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;

  // Other
  opening?: { name: string; eco: string };

  // Comments
  currentMoveComment: string;
  onSaveComment: (comment: string) => void;
  readOnlyComments?: boolean; // If true, comments are read-only

  // Create Study
  onCreateStudy?: () => void;

  // Study metadata (for review mode)
  studyName?: string;
  studyCategory?: string;
  studyDescription?: string;

  // Like functionality (for review mode)
  studyId?: string;
  isLiked?: boolean;
  likesCount?: number;
  isLiking?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
}
