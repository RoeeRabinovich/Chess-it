import { useMemo, useCallback } from "react";
import { ChessMove, MovePath, MoveNode } from "../../../types/chess";
import { Study } from "../../../types/study";
import { useChessGameReview } from "../../../hooks/useChessGameReview/useChessGameReview";

interface UseReviewStudyLayoutProps {
  studyGameState: {
    position: string;
    moveTree: MoveNode[];
    currentPath: MovePath;
    isFlipped: boolean;
    opening?: string | { name: string; eco: string };
    comments?: Record<string, string>;
  };
  study: Study | null;
  opening: { name: string; eco: string } | null;
  onNavigationError: (message: string) => void;
}

export const useReviewStudyLayout = ({
  studyGameState,
  study,
  opening,
  onNavigationError,
}: UseReviewStudyLayoutProps) => {
  // Normalize studyGameState to match useChessGameReview expectations
  const normalizedStudyGameState = useMemo(() => {
    const normalizedOpening: { name: string; eco: string } | undefined =
      studyGameState.opening && typeof studyGameState.opening === "string"
        ? { name: studyGameState.opening, eco: "" }
        : studyGameState.opening && typeof studyGameState.opening === "object"
          ? studyGameState.opening
          : undefined;

    return {
      ...studyGameState,
      opening: normalizedOpening,
    };
  }, [studyGameState]);

  // Chess game state for review
  const chessGameReview = useChessGameReview({
    studyGameState: normalizedStudyGameState,
    onNavigationError,
  });

  // Handler for layout - uses MovePath for tree structure
  const handleMoveClick = useCallback(
    (path: MovePath) => {
      chessGameReview.navigateToBranchMove(path);
    },
    [chessGameReview],
  );

  const handleSaveComment = useCallback(() => {
    // Comments are read-only in review mode - do nothing
  }, []);

  // Get current move comment reactively (updates when navigating between moves)
  const currentMoveComment = useMemo(() => {
    return chessGameReview.getComment() || "";
  }, [chessGameReview]);

  // Prepare layout props for review mode
  const layoutProps = useMemo(
    () => ({
      gameState: chessGameReview.gameState,
      makeMove: (move: ChessMove) => chessGameReview.makeMove(move),
      onMoveClick: handleMoveClick,
      currentPath: chessGameReview.currentPath,
      // Engine disabled in review mode
      isEngineEnabled: false,
      isAnalyzing: false,
      formattedEngineLines: [],
      displayEvaluation: { evaluation: 0, possibleMate: null },
      // Controls
      onFlipBoard: chessGameReview.flipBoard,
      onUndo: chessGameReview.undoMove,
      onReset: chessGameReview.resetGame,
      onLoadFEN: () => false, // Disabled
      onLoadPGN: () => false, // Disabled
      canUndo: chessGameReview.canUndo,
      canGoToPreviousMove: chessGameReview.canGoToPreviousMove,
      canGoToNextMove: chessGameReview.canGoToNextMove,
      onPreviousMove: chessGameReview.goToPreviousMove,
      onNextMove: chessGameReview.goToNextMove,
      // Engine settings disabled
      isEngineEnabledForSettings: false,
      onEngineToggle: () => {}, // No-op
      engineLinesCount: 3,
      onEngineLinesCountChange: () => {}, // No-op
      engineDepth: 12,
      onEngineDepthChange: () => {}, // No-op
      analysisMode: "quick" as const,
      onAnalysisModeChange: () => {}, // No-op (engine disabled in review mode)
      boardScale: 1.0,
      onBoardScaleChange: () => {}, // Optional: could allow board scaling
      // Other
      opening:
        opening ||
        (study?.gameState?.opening
          ? typeof study.gameState.opening === "string"
            ? { name: study.gameState.opening, eco: "" }
            : study.gameState.opening
          : undefined),
      currentMoveComment,
      onSaveComment: handleSaveComment,
      readOnlyComments: true, // Comments are read-only in review mode
      // Create Study button hidden
      onCreateStudy: undefined,
      // Study metadata (replaces engine lines in review mode)
      studyName: study?.studyName,
      studyCategory: study?.category,
      studyDescription: study?.description,
    }),
    [
      chessGameReview,
      handleMoveClick,
      handleSaveComment,
      opening,
      study?.gameState?.opening,
      currentMoveComment,
      study?.studyName,
      study?.category,
      study?.description,
    ],
  );

  return {
    layoutProps,
    chessGameReview,
  };
};
