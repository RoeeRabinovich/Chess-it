import { useCallback, useState } from "react";

import type { BranchContext, ChessGameState } from "../../types/chess";
import {
  buildBranchCommentKey,
  buildMainCommentKey,
  resolveCommentKey,
} from "../../utils/chessCommentUtils";

interface UseChessCommentsParams {
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
}

export const useChessComments = ({
  gameState,
  setGameState,
}: UseChessCommentsParams) => {
  const [currentBranchContext, setCurrentBranchContext] = useState<BranchContext | null>(null);

  const getCommentKey = useCallback(
    (moveIndex: number, branchId?: string, moveIndexInBranch?: number) => {
      if (branchId !== undefined && moveIndexInBranch !== undefined) {
        return buildBranchCommentKey(branchId, moveIndexInBranch);
      }
      return buildMainCommentKey(moveIndex);
    },
    [],
  );

  const addComment = useCallback(
    (comment: string) => {
      setGameState((prev) => {
        const comments = new Map(prev.comments ?? new Map());
        const key = resolveCommentKey(prev.currentMoveIndex, currentBranchContext);

        if (comment.trim() === "") {
          comments.delete(key);
        } else {
          comments.set(key, comment);
        }

        return {
          ...prev,
          comments,
        };
      });
    },
    [currentBranchContext, setGameState],
  );

  const getComment = useCallback(() => {
    if (gameState.currentMoveIndex < 0 && !currentBranchContext) {
      return "";
    }

    const comments = gameState.comments ?? new Map();
    const key = resolveCommentKey(gameState.currentMoveIndex, currentBranchContext);
    return comments.get(key) ?? "";
  }, [currentBranchContext, gameState.comments, gameState.currentMoveIndex]);

  return {
    currentBranchContext,
    setCurrentBranchContext,
    addComment,
    getComment,
    getCommentKey,
  };
};
