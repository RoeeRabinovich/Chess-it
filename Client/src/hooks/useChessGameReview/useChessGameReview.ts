import { useRef, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import type {
  ChessGameState,
  ChessMove,
  MoveData,
  MovePath,
} from "../../types/chess";
import { useChessComments } from "../useChessGame/useChessComments";
import { useTreeChessNavigation } from "../useChessGame/treeChessNavigation";
import { useChessTools } from "../useChessGame/useChessTools";
import { useStudyInitialization } from "./useStudyInitialization";
import { makeReviewMove, undoReviewMove } from "./reviewMoveHandlers";
import { getMainLineMoves } from "../../utils/moveTreeUtils";

interface UseChessGameReviewParams {
  studyGameState: {
    position: string;
    moveTree: ChessGameState["moveTree"];
    rootBranches?: ChessGameState["rootBranches"];
    startingPosition?: string;
    currentPath: ChessGameState["currentPath"];
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

  const { getComment } = useChessComments({ gameState, setGameState });

  // Store the starting position from studyGameState for navigation
  const startingPosition = useMemo(
    () =>
      studyGameState.startingPosition ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    [studyGameState.startingPosition],
  );

  const makeMove = useCallback(
    (move: ChessMove | MoveData): boolean => {
      return makeReviewMove({
        chessRef,
        gameState,
        setGameState,
        startingPosition,
        onInvalidMove,
      })(move);
    },
    [gameState, setGameState, startingPosition, onInvalidMove],
  );

  const undoMove = useCallback((): boolean => {
    return undoReviewMove({
      chessRef,
      gameState,
      setGameState,
      startingPosition,
    })();
  }, [gameState, setGameState, startingPosition]);

  const navigation = useTreeChessNavigation({
    chessRef,
    gameState,
    setGameState,
    startingPosition, // Pass the starting position for review mode
  });

  const tools = useChessTools({
    chessRef,
    setGameState,
    createInitialState: () => gameState, // Use current state as initial
  });

  const mainLineMoves = useMemo(() => {
    return getMainLineMoves(gameState.moveTree);
  }, [gameState.moveTree]);

  const helpers = useMemo(() => {
    const currentPath = gameState.currentPath;
    const isAtStart = currentPath.length === 0;
    const mainIndex = currentPath.length > 0 ? currentPath[0] : -1;
    const isAtEnd = mainIndex >= mainLineMoves.length - 1;

    return {
      canUndo: !isAtStart,
      canGoToPreviousMove: !isAtStart,
      canGoToNextMove: !isAtEnd,
    };
  }, [gameState.currentPath, mainLineMoves.length]);

  // Navigation wrappers for review mode
  const navigateToMove = useCallback(
    (moveIndex: number) => {
      if (moveIndex < 0) {
        navigation.navigateToPath([]);
        return;
      }
      navigation.navigateToMainLineMove(moveIndex);
    },
    [navigation],
  );

  const navigateToBranchMove = useCallback(
    (path: MovePath) => {
      try {
        navigation.navigateToBranchMove(path);
      } catch {
        onNavigationError?.("Failed to navigate to branch move.");
      }
    },
    [navigation, onNavigationError],
  );

  const goToPreviousMove = useCallback(() => {
    try {
      navigation.goToPreviousMove();
    } catch {
      onNavigationError?.("Failed to navigate to previous move.");
    }
  }, [navigation, onNavigationError]);

  const goToNextMove = useCallback(() => {
    try {
      navigation.goToNextMove();
    } catch {
      onNavigationError?.("Failed to navigate to next move.");
    }
  }, [navigation, onNavigationError]);

  return {
    gameState,
    makeMove,
    undoMove,
    resetGame: () => {
      // Reset to starting position using navigation
      try {
        navigation.navigateToPath([]);
      } catch (error) {
        console.error("Error resetting game:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        onNavigationError?.(
          `Failed to reset the game to the starting position: ${errorMessage}`,
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
    currentPath: gameState.currentPath, // Return currentPath instead of currentBranchContext
  };
};
