import { useCallback } from "react";
import type { Chess } from "chess.js";
import type {
  BranchContext,
  ChessGameState,
  ChessMove,
} from "../../types/chess";
import { findBranchByFirstMove } from "../../utils/chessBranchUtils";
import { toChessMove, toMoveData } from "../../utils/chessMoveUtils";
import {
  loadPositionForMove,
  handleBranchContinuation,
  handleBranchNavigation,
  handleBranchCreation,
} from "./moveHandlers";

interface UseChessMoveManagerParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  getCommentKey: (
    moveIndex: number,
    branchId?: string,
    moveIndexInBranch?: number,
  ) => string;
  setCurrentBranchContext: React.Dispatch<
    React.SetStateAction<BranchContext | null>
  >;
  currentBranchContext: BranchContext | null;
}

export const useChessMoveManager = ({
  chessRef,
  gameState,
  setGameState,
  getCommentKey,
  setCurrentBranchContext,
  currentBranchContext,
}: UseChessMoveManagerParams) => {
  const makeMove = useCallback(
    (move: ChessMove | { from: string; to: string; promotion?: string }) => {
      try {
        const moveData = toMoveData(move);
        const isAtEndOfMainLine =
          gameState.currentMoveIndex === gameState.moves.length - 1;

        if (!isAtEndOfMainLine) {
          if (!loadPositionForMove(chessRef.current, gameState)) {
            return false;
          }

          // Check if we're continuing a branch forward
          const currentBranch = currentBranchContext
            ? gameState.branches.find(
                (b) => b.id === currentBranchContext.branchId,
              )
            : null;

          const isContinuingBranch =
            currentBranchContext &&
            currentBranch &&
            currentBranchContext.moveIndexInBranch ===
              currentBranch.moves.length - 1;

          if (isContinuingBranch && currentBranchContext && currentBranch) {
            return handleBranchContinuation(
              chessRef.current,
              moveData,
              currentBranchContext,
              currentBranch,
              setGameState,
              setCurrentBranchContext,
            );
          }

          // Check if this move matches an existing branch's first move
          const matchingBranch = findBranchByFirstMove(
            gameState.branches,
            gameState.currentMoveIndex + 1,
            moveData,
          );

          if (matchingBranch) {
            return handleBranchNavigation(
              chessRef.current,
              matchingBranch,
              gameState,
              setGameState,
              setCurrentBranchContext,
            );
          }

          // Create a new branch
          return handleBranchCreation(
            chessRef.current,
            moveData,
            gameState,
            currentBranchContext,
            setGameState,
            setCurrentBranchContext,
          );
        }

        const result = chessRef.current.move(moveData);
        if (!result) {
          return false;
        }

        const newMove = toChessMove(result);
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moves: [...prev.moves, newMove],
          currentMoveIndex: prev.currentMoveIndex + 1,
        }));
        return true;
      } catch (error) {
        console.error("Invalid move:", error);
        return false;
      }
    },
    [
      chessRef,
      gameState,
      setGameState,
      currentBranchContext,
      setCurrentBranchContext,
    ],
  );

  const undoMove = useCallback(() => {
    try {
      const move = chessRef.current.undo();
      if (!move) {
        return false;
      }

      setGameState((prev) => {
        const newMoves = prev.moves.slice(0, -1);
        const newCurrentIndex = Math.max(-1, prev.currentMoveIndex - 1);
        const commentKey = getCommentKey(prev.moves.length - 1);
        const comments = new Map(prev.comments ?? new Map());
        comments.delete(commentKey);

        if (newCurrentIndex < prev.moves.length - 1) {
          setCurrentBranchContext(null);
        }

        return {
          ...prev,
          position: chessRef.current.fen(),
          moves: newMoves,
          currentMoveIndex: newCurrentIndex,
          comments,
        };
      });

      return true;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  }, [chessRef, getCommentKey, setCurrentBranchContext, setGameState]);

  return {
    makeMove,
    undoMove,
  };
};
