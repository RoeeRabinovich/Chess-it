import { ChessMove, MoveBranch } from "./chess";

export interface StudyLayoutProps {
  // Game state
  gameState: {
    position: string;
    moves: ChessMove[];
    branches: MoveBranch[];
    currentMoveIndex: number;
    isFlipped: boolean;
  };
  makeMove: (move: ChessMove) => boolean;
  onMoveClick: (moveIndex: number) => void;
  onBranchMoveClick: (branchId: string, moveIndexInBranch: number) => void;

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
  onRedo: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;

  // Other
  opening?: { name: string; eco: string };
}
