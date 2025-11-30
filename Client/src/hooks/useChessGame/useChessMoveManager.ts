import { useCallback } from "react";

import type { Chess } from "chess.js";

import type {
  BranchContext,
  ChessGameState,
  ChessMove,
  MoveBranch,
} from "../../types/chess";
import {
  findBranchAtStartIndex,
  findBranchByFirstMove,
  createBranchId,
  loadBranchPosition,
} from "../../utils/chessBranchUtils";
import { toChessMove, toMoveData } from "../../utils/chessMoveUtils";

interface UseChessMoveManagerParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  getCommentKey: (moveIndex: number, branchId?: string, moveIndexInBranch?: number) => string;
  setCurrentBranchContext: React.Dispatch<React.SetStateAction<BranchContext | null>>;
  currentBranchContext: BranchContext | null;
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
  currentBranchContext,
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

          // Check if we're continuing a branch forward (already in branch and extending it)
          const currentBranch = currentBranchContext
            ? gameState.branches.find((b) => b.id === currentBranchContext.branchId)
            : null;

          const isContinuingBranch =
            currentBranchContext &&
            currentBranch &&
            // We're at the end of the branch, so we're extending it
            currentBranchContext.moveIndexInBranch === currentBranch.moves.length - 1;

          if (isContinuingBranch && currentBranchContext && currentBranch) {
            // Continue/extend the current branch - append move
            const result = chessRef.current.move(moveData);
            if (!result) {
              return false;
            }

            const newMove = toChessMove(result);
            setGameState((prev) => ({
              ...prev,
              position: chessRef.current.fen(),
              branches: appendMoveToBranch(
                prev.branches,
                currentBranchContext.branchId,
                newMove,
              ),
            }));
            setCurrentBranchContext({
              branchId: currentBranchContext.branchId,
              moveIndexInBranch: currentBranchContext.moveIndexInBranch + 1,
            });
            return true;
          }

          // Not continuing branch - check if this move matches an existing branch's first move
          const matchingBranch = findBranchByFirstMove(
            gameState.branches,
            gameState.currentMoveIndex + 1,
            moveData,
          );

          if (matchingBranch) {
            // Navigate to the existing branch (to its first move)
            const success = loadBranchPosition(
              chessRef.current,
              gameState.moves,
              matchingBranch,
              0,
              gameState.branches, // Pass all branches for parent branch resolution
            );
            if (!success) {
              return false;
            }

            setGameState((prev) => ({
              ...prev,
              position: chessRef.current.fen(),
              currentMoveIndex: matchingBranch.startIndex - 1,
            }));
            setCurrentBranchContext({
              branchId: matchingBranch.id,
              moveIndexInBranch: 0,
            });
            return true;
          }

          // No matching branch - create a new branch
          const result = chessRef.current.move(moveData);
          if (!result) {
            return false;
          }

          const newMove = toChessMove(result);
          const branchId = createBranchId(gameState.currentMoveIndex);
          
          // If we're currently in a branch, this new branch is a child of that branch
          const parentBranchId = currentBranchContext?.branchId;
          
          // Calculate startIndex: if in a branch, use the parent branch's startIndex
          // (both branches start from the same main line position)
          // Otherwise use the main line index
          let startIndex = gameState.currentMoveIndex + 1;
          if (parentBranchId) {
            const parentBranch = gameState.branches.find((b) => b.id === parentBranchId);
            if (parentBranch) {
              // New branch starts from the same main line position as parent branch
              startIndex = parentBranch.startIndex;
            }
          }
          
          const newBranch: MoveBranch = {
            id: branchId,
            parentMoveIndex: gameState.currentMoveIndex,
            moves: [newMove],
            startIndex,
            parentBranchId, // Track parent branch if created from a branch
          };
          setGameState((prev) => ({
            ...prev,
            position: chessRef.current.fen(),
            branches: [...prev.branches, newBranch],
          }));
          setCurrentBranchContext({
            branchId,
            moveIndexInBranch: 0,
          });

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
