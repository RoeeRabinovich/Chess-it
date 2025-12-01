import { useCallback } from "react";

import type { ChessGameState, MovePath } from "../../types/chess";
import { pathToString } from "../../utils/moveTreeUtils";

interface UseChessCommentsParams {
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
}

export const useChessComments = ({
  gameState,
  setGameState,
}: UseChessCommentsParams) => {
  const getCommentKey = useCallback((path: MovePath) => {
    return pathToString(path);
  }, []);

  const addComment = useCallback(
    (comment: string) => {
      setGameState((prev) => {
        const comments = new Map(prev.comments ?? new Map());
        const key = pathToString(prev.currentPath);

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
    [setGameState],
  );

  const getComment = useCallback(() => {
    if (!gameState.currentPath || gameState.currentPath.length === 0) {
      return "";
    }

    const comments = gameState.comments ?? new Map();
    const key = pathToString(gameState.currentPath);
    return comments.get(key) ?? "";
  }, [gameState.comments, gameState.currentPath]);

  return {
    addComment,
    getComment,
    getCommentKey,
  };
};
