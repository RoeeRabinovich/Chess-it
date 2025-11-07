import { useCallback } from "react";

import type { Chess } from "chess.js";

import type {
  BranchContext,
  ChessGameState,
  ChessMove,
  MoveBranch,
} from "../../types/chess";
import { findBranchAtStartIndex, createBranchId } from "../../utils/chessBranchUtils";
import { toChessMove, toMoveData } from "../../utils/chessMoveUtils";

interface UseChessMoveManagerParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  getCommentKey: (moveIndex: number, branchId?: string, moveIndexInBranch?: number) => string;
  setCurrentBranchContext: React.Dispatch<React.SetStateAction<BranchContext | null>>;
}

const appendMoveToBranch = (
  branches: MoveBranch[],
  branchId: string,
  move: ChessMove,
): MoveBranch[] =>
  branches.map((branch) =>
    branch.id === branchId ? { ...branch, moves: [...branch.moves, move] } : branch,
  );

export const useChessMoveManager = ({
  chessRef,
  gameState,
  setGameState,
  getCommentKey,
  setCurrentBranchContext,
}: UseChessMoveManagerParams) => {
  const makeMove = useCallback(
    (move: ChessMove | { from: string; to: string; promotion?: string }) => {
      try {
        const moveData = toMoveData(move);
        const isAtEndOfMainLine =
          gameState.currentMoveIndex === gameState.moves.length - 1;

        if (!isAtEndOfMainLine) {
          try {
            chessRef.current.load(gameState.position);
          } catch (error) {
            chessRef.current.reset();
            const movesToBranchPoint = gameState.moves.slice(
              0,
              gameState.currentMoveIndex + 1,
            );
            for (const branchMove of movesToBranchPoint) {
              const replay = chessRef.current.move({
                from: branchMove.from,
                to: branchMove.to,
                promotion: branchMove.promotion,
              });
              if (!replay) {
                chessRef.current.reset();
                return false;
              }
            }
          }

          const existingBranch = findBranchAtStartIndex(
            gameState.branches,
            gameState.currentMoveIndex + 1,
          );

          const result = chessRef.current.move(moveData);
          if (!result) {
            return false;
          }

          const newMove = toChessMove(result);

          if (existingBranch) {
            setGameState((prev) => ({
              ...prev,
              position: chessRef.current.fen(),
              branches: appendMoveToBranch(prev.branches, existingBranch.id, newMove),
            }));
          } else {
            const branchId = createBranchId(gameState.currentMoveIndex);
            const newBranch: MoveBranch = {
              id: branchId,
              parentMoveIndex: gameState.currentMoveIndex,
              moves: [newMove],
              startIndex: gameState.currentMoveIndex + 1,
            };
            setGameState((prev) => ({
              ...prev,
              position: chessRef.current.fen(),
              branches: [...prev.branches, newBranch],
            }));
          }

          return true;
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
    [chessRef, gameState, setGameState],
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
