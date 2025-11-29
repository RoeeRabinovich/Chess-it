import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { ChessGameState, ChessMove, MoveData } from "../types/chess";
import { useChessComments } from "./useChessGame/useChessComments";
import { useChessNavigation } from "./useChessGame/useChessNavigation";
import { useChessTools } from "./useChessGame/useChessTools";
import { toMoveData } from "../utils/chessMoveUtils";

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
  const [gameState, setGameState] = useState<ChessGameState>(() => {
    // Convert comments from object to Map
    const commentsMap = new Map<string, string>();
    if (studyGameState.comments) {
      Object.entries(studyGameState.comments).forEach(([key, value]) => {
        commentsMap.set(key, value);
      });
    }

    // Initialize with study data - moves will be properly set in useEffect
    return {
      position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Start at beginning, will be updated
      moves: studyGameState.moves || [],
      branches: studyGameState.branches || [],
      currentMoveIndex: -1, // Start at beginning, will be updated
      isFlipped: studyGameState.isFlipped || false,
      opening: studyGameState.opening,
      comments: commentsMap,
    };
  });

  // Use ref to track if we've already initialized to prevent infinite loops
  const initializedRef = useRef<string | null>(null);

  // Create a stable key from studyGameState to detect actual changes
  const movesKey = studyGameState.moves
    ? studyGameState.moves.map((m) => `${m.from}${m.to}`).join(",")
    : "";
  const studyKey = useMemo(() => {
    if (!studyGameState.moves || studyGameState.moves.length === 0) {
      return "empty";
    }
    return `${studyGameState.moves.length}-${studyGameState.currentMoveIndex}-${movesKey}`;
  }, [studyGameState.moves, studyGameState.currentMoveIndex, movesKey]);

  // Initialize chess instance with study's position and moves
  useEffect(() => {
    // Skip if we've already initialized with this study data
    if (initializedRef.current === studyKey) {
      return;
    }

    // Only initialize if we have valid study data (not the default empty state)
    if (!studyGameState.moves || studyGameState.moves.length === 0) {
      // Empty study - just reset to starting position
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
        moves: [],
      }));
      initializedRef.current = studyKey;
      return;
    }

    try {
      // Always start from the beginning (initial position) for review
      chessRef.current.reset();

      // Start at the initial position (index -1) so user can navigate forward
      // Don't replay any moves - start at the beginning
      const targetIndex = -1;

      // Update position and state to match starting position
      const currentFen = chessRef.current.fen();

      // Ensure comments Map is up to date from study data
      const commentsMap = new Map<string, string>();
      if (studyGameState.comments) {
        Object.entries(studyGameState.comments).forEach(([key, value]) => {
          commentsMap.set(key, value);
        });
      }

      setGameState((prev) => {
        // Only update if something actually changed to prevent loops
        if (
          prev.position === currentFen &&
          prev.currentMoveIndex === targetIndex &&
          prev.moves.length === studyGameState.moves.length
        ) {
          return prev;
        }
        return {
          ...prev,
          position: currentFen,
          moves: studyGameState.moves,
          branches: studyGameState.branches || [],
          currentMoveIndex: targetIndex, // Start at beginning
          comments: commentsMap, // Use comments from study data
        };
      });
      initializedRef.current = studyKey;
    } catch (error) {
      console.error("Error initializing chess game from study:", error);
      // On error, reset to starting position
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
        moves: studyGameState.moves || [],
      }));
      initializedRef.current = studyKey;
    }
  }, [studyKey, studyGameState]);

  const { currentBranchContext, setCurrentBranchContext, getComment } =
    useChessComments({ gameState, setGameState });

  // Restricted makeMove - only allows moves matching study's move history
  const makeMove = useCallback(
    (move: ChessMove | MoveData): boolean => {
      try {
        const moveData = toMoveData(move);
        const nextMoveIndex = gameState.currentMoveIndex + 1;

        // Check if we're at the end of the main line
        if (nextMoveIndex >= gameState.moves.length) {
          // No more moves in the study - block any new moves
          onInvalidMove?.(
            "You've reached the end of this study. No more moves available.",
          );
          return false;
        }

        // Get the next expected move from the study
        const expectedMove = gameState.moves[nextMoveIndex];

        // Validate that the attempted move matches the expected move
        const matchesExpected =
          moveData.from === expectedMove.from &&
          moveData.to === expectedMove.to &&
          (moveData.promotion || "") === (expectedMove.promotion || "");

        if (!matchesExpected) {
          // Move doesn't match - block it
          onInvalidMove?.(
            `This move is not part of the study. The next move should be ${expectedMove.san}.`,
          );
          return false;
        }

        // Move matches - execute it
        const result = chessRef.current.move(moveData);
        if (!result) {
          return false;
        }

        // Update game state to reflect the move
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          currentMoveIndex: nextMoveIndex,
        }));

        return true;
      } catch (error) {
        console.error("Invalid move:", error);
        return false;
      }
    },
    [gameState.currentMoveIndex, gameState.moves, onInvalidMove],
  );

  // Restricted undo - only allow if we're not at the beginning
  const undoMove = useCallback((): boolean => {
    if (gameState.currentMoveIndex < 0) {
      return false;
    }

    try {
      const move = chessRef.current.undo();
      if (!move) {
        return false;
      }

      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: prev.currentMoveIndex - 1,
      }));

      return true;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  }, [gameState.currentMoveIndex]);

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

  // Wrapper functions with error handling
  const navigateToMove = useCallback(
    (moveIndex: number) => {
      // Validate move index
      if (moveIndex < -1 || moveIndex >= gameState.moves.length) {
        onNavigationError?.(
          `Invalid move index. Please select a valid move from the move history.`,
        );
        return;
      }

      try {
        navigation.navigateToMove(moveIndex);
      } catch (error) {
        console.error("Error navigating to move:", error);
        onNavigationError?.(
          "Failed to navigate to this move. The study data may be corrupted.",
        );
      }
    },
    [navigation, gameState.moves.length, onNavigationError],
  );

  const navigateToBranchMove = useCallback(
    (branchId: string, moveIndexInBranch: number) => {
      const branch = gameState.branches.find((b) => b.id === branchId);
      if (!branch) {
        onNavigationError?.(
          "Branch not found. This branch may have been removed.",
        );
        return;
      }

      if (moveIndexInBranch < 0 || moveIndexInBranch >= branch.moves.length) {
        onNavigationError?.(
          "Invalid branch move index. Please select a valid move from the branch.",
        );
        return;
      }

      try {
        navigation.navigateToBranchMove(branchId, moveIndexInBranch);
      } catch (error) {
        console.error("Error navigating to branch move:", error);
        onNavigationError?.(
          "Failed to navigate to this branch move. The study data may be corrupted.",
        );
      }
    },
    [navigation, gameState.branches, onNavigationError],
  );

  const goToPreviousMove = useCallback(() => {
    if (!helpers.canGoToPreviousMove) {
      return;
    }
    try {
      navigation.goToPreviousMove();
    } catch (error) {
      console.error("Error going to previous move:", error);
      onNavigationError?.("Failed to navigate to the previous move.");
    }
  }, [navigation, helpers.canGoToPreviousMove, onNavigationError]);

  const goToNextMove = useCallback(() => {
    if (!helpers.canGoToNextMove) {
      return;
    }
    try {
      navigation.goToNextMove();
    } catch (error) {
      console.error("Error going to next move:", error);
      onNavigationError?.("Failed to navigate to the next move.");
    }
  }, [navigation, helpers.canGoToNextMove, onNavigationError]);

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
