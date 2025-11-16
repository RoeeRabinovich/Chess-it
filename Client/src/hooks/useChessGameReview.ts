import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { ChessGameState, ChessMove, MoveData } from "../types/chess";
import { useChessComments } from "./useChessGame/useChessComments";
import { useChessNavigation } from "./useChessGame/useChessNavigation";
import { useChessTools } from "./useChessGame/useChessTools";
import { replayMoves } from "../utils/chessMoveUtils";
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
}

/**
 * Custom hook for reviewing a study with restricted move validation
 * Only allows moves that match the study's move history
 */
export const useChessGameReview = ({
  studyGameState,
  onInvalidMove,
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

  // Initialize chess instance with study's position and moves
  useEffect(() => {
    // Only initialize if we have valid study data (not the default empty state)
    if (!studyGameState.moves || studyGameState.moves.length === 0) {
      // Empty study - just reset to starting position
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
      }));
      return;
    }

    try {
      // Always start from the beginning and replay moves
      chessRef.current.reset();

      // Replay moves up to currentMoveIndex
      const targetIndex = Math.max(
        -1,
        Math.min(
          studyGameState.currentMoveIndex,
          studyGameState.moves.length - 1,
        ),
      );

      if (targetIndex >= 0 && studyGameState.moves.length > 0) {
        const success = replayMoves(
          chessRef.current,
          studyGameState.moves,
          targetIndex + 1,
        );
        if (!success) {
          console.error("Failed to replay moves from study");
          // Reset to starting position if replay fails
          chessRef.current.reset();
          setGameState((prev) => ({
            ...prev,
            position: chessRef.current.fen(),
            currentMoveIndex: -1,
          }));
          return;
        }
      }

      // Update position and state to match current position after replaying
      const currentFen = chessRef.current.fen();
      setGameState((prev) => ({
        ...prev,
        position: currentFen,
        moves: studyGameState.moves,
        branches: studyGameState.branches || [],
        currentMoveIndex: targetIndex,
      }));
    } catch (error) {
      console.error("Error initializing chess game from study:", error);
      // On error, reset to starting position
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
      }));
    }
  }, [studyGameState]);

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

  return {
    gameState,
    makeMove,
    undoMove,
    resetGame: () => {
      // Reset to initial study position
      chessRef.current.reset();
      if (
        studyGameState.position !==
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      ) {
        chessRef.current.load(studyGameState.position);
      }
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
      }));
      setCurrentBranchContext(null);
    },
    flipBoard: tools.flipBoard,
    loadFEN: () => false, // Disabled in review mode
    loadPGN: () => false, // Disabled in review mode
    navigateToMove: navigation.navigateToMove,
    navigateToBranchMove: navigation.navigateToBranchMove,
    goToPreviousMove: navigation.goToPreviousMove,
    goToNextMove: navigation.goToNextMove,
    getComment,
    canUndo: helpers.canUndo,
    canGoToPreviousMove: helpers.canGoToPreviousMove,
    canGoToNextMove: helpers.canGoToNextMove,
    currentBranchContext,
  };
};
