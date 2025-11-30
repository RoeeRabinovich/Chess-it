import { useRef, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import type { ChessGameState, ChessMove, MoveData } from "../types/chess";
import { useChessComments } from "./useChessGame/useChessComments";
import { useChessNavigation } from "./useChessGame/useChessNavigation";
import { useChessTools } from "./useChessGame/useChessTools";
import { useStudyInitialization } from "./useChessGameReview/useStudyInitialization";
import {
  makeReviewMove,
  undoReviewMove,
} from "./useChessGameReview/reviewMoveHandlers";
import { createReviewNavigationWrappers } from "./useChessGameReview/reviewNavigationWrappers";

interface UseChessGameReviewParams {
  studyGameState: {
    position: string;
    moves: ChessMove[];
    branches: ChessGameState["branches"];
    currentMoveIndex: number;
    isFlipped: boolean;
    opening?: ChessGameState["opening"];
    comments?: Record<string, string>;
  };
  onInvalidMove?: (message: string) => void;
  onNavigationError?: (message: string) => void;
}

/**
 * Custom hook for reviewing a study with restricted move validation
 * Only allows moves that match the study's move history
 */
export const useChessGameReview = ({
  studyGameState,
  onInvalidMove,
  onNavigationError,
}: UseChessGameReviewParams) => {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useStudyInitialization({
    studyGameState,
    chessRef,
  });

  const { currentBranchContext, setCurrentBranchContext, getComment } =
    useChessComments({ gameState, setGameState });

  const makeMove = useCallback(
    (move: ChessMove | MoveData): boolean => {
      return makeReviewMove({
        chessRef,
        gameState,
        setGameState,
        onInvalidMove,
      })(move);
    },
    [gameState, setGameState, onInvalidMove],
  );

  const undoMove = useCallback((): boolean => {
    return undoReviewMove({
      chessRef,
      gameState,
      setGameState,
    })();
  }, [gameState, setGameState]);

  const navigation = useChessNavigation({
    chessRef,
    gameState,
    setGameState,
    setCurrentBranchContext,
  });

  const tools = useChessTools({
    chessRef,
    setGameState,
    createInitialState: () => gameState, // Use current state as initial
    setCurrentBranchContext,
  });

  const helpers = useMemo(
    () => ({
      canUndo: gameState.currentMoveIndex >= 0,
      canGoToPreviousMove: gameState.currentMoveIndex >= 0,
      canGoToNextMove: gameState.currentMoveIndex < gameState.moves.length - 1,
    }),
    [gameState.currentMoveIndex, gameState.moves.length],
  );

  const {
    navigateToMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
  } = useMemo(
    () =>
      createReviewNavigationWrappers({
        navigation,
        gameState,
        onNavigationError,
      }),
    [navigation, gameState, onNavigationError],
  );

  return {
    gameState,
    makeMove,
    undoMove,
    resetGame: () => {
      // Reset to starting position (index -1) using navigation
      try {
        navigateToMove(-1);
      } catch (error) {
        console.error("Error resetting game:", error);
        onNavigationError?.(
          "Failed to reset the game to the starting position.",
        );
      }
    },
    flipBoard: tools.flipBoard,
    loadFEN: () => false, // Disabled in review mode
    loadPGN: () => false, // Disabled in review mode
    navigateToMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
    getComment,
    canUndo: helpers.canUndo,
    canGoToPreviousMove: helpers.canGoToPreviousMove,
    canGoToNextMove: helpers.canGoToNextMove,
    currentBranchContext,
  };
};
