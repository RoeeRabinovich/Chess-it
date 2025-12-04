import { useCallback } from "react";
import { Chess } from "chess.js";
import type { ChessGameState, MovePath } from "../../types/chess";
import {
  ROOT_PATH_INDEX,
  getBranchContextForPath,
  isRootBranchPath,
  loadPositionFromPath,
} from "../../utils/moveTreeUtils";
import { isAtEndOfPath } from "./treeMoveHandlers";

interface UndoMoveHandlerParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  getCommentKey: (path: MovePath) => string;
}

/**
 * Handles undo move functionality - deletes the last move from the move tree
 * Can only delete if we're at the end of the current path (last move played)
 */
export const useUndoMove = ({
  chessRef,
  gameState,
  setGameState,
  getCommentKey,
}: UndoMoveHandlerParams) => {
  const undoMove = useCallback(() => {
    try {
      const currentPath = gameState.currentPath;

      // Check if we're at the end of the path (can only delete last move)
      const isAtEnd = isAtEndOfPath(
        gameState.moveTree,
        gameState.rootBranches,
        currentPath,
      );

      if (!isAtEnd) {
        // Can only delete the last move in a sequence
        return false;
      }

      // Can't delete if already at starting position
      if (currentPath.length === 0) {
        return false;
      }

      setGameState((prev) => {
        // Create deep copies to avoid mutation
        const treeCopy = JSON.parse(
          JSON.stringify(prev.moveTree),
        ) as typeof prev.moveTree;
        const rootBranchesCopy = JSON.parse(
          JSON.stringify(prev.rootBranches || []),
        ) as typeof prev.rootBranches;

        // Calculate previous path and delete the move
        let newPath: MovePath;
        const deletedCommentKey = getCommentKey(currentPath);

        if (isRootBranchPath(currentPath)) {
          // Deleting from root branch
          const branchIndex = currentPath[1];
          const moveIndex = currentPath[2];

          if (branchIndex === undefined || moveIndex === undefined) {
            return prev;
          }

          const branchSequence = rootBranchesCopy[branchIndex];
          if (
            !branchSequence ||
            moveIndex < 0 ||
            moveIndex >= branchSequence.length
          ) {
            return prev;
          }

          // Delete the last move from the branch sequence
          branchSequence.pop();

          // Calculate new path
          if (moveIndex > 0) {
            newPath = [ROOT_PATH_INDEX, branchIndex, moveIndex - 1];
          } else {
            // Branch is now empty - remove the entire branch
            rootBranchesCopy.splice(branchIndex, 1);
            newPath = [];
          }
        } else if (currentPath.length === 1) {
          // Deleting from main line
          const mainIndex = currentPath[0];
          if (mainIndex < 0 || mainIndex >= treeCopy.length) {
            return prev;
          }

          // Delete the last move from main line
          treeCopy.pop();

          // Calculate new path
          if (mainIndex > 0) {
            newPath = [mainIndex - 1];
          } else {
            newPath = [];
          }
        } else {
          // Deleting from a branch (not root branch)
          const branchContext = getBranchContextForPath(
            treeCopy,
            rootBranchesCopy,
            currentPath,
          );

          if (!branchContext) {
            return prev;
          }

          const { sequence, moveIndex } = branchContext;

          // Delete the last move from the branch sequence
          sequence.pop();

          // Calculate new path
          const newPathArray = [...currentPath];
          if (moveIndex > 0) {
            newPathArray[newPathArray.length - 1] = moveIndex - 1;
            newPath = newPathArray;
          } else {
            // Branch is now empty - go back to parent
            newPath = newPathArray.slice(0, -2);
            if (newPath.length === 1 && newPath[0] === ROOT_PATH_INDEX) {
              newPath = [];
            }
          }
        }

        // Load position for the new path
        const chess = new Chess(prev.startingPosition || undefined);
        const loadSuccess = loadPositionFromPath(
          chess,
          treeCopy,
          newPath,
          prev.startingPosition,
          rootBranchesCopy,
        );

        if (!loadSuccess) {
          console.error("Failed to load position after deletion");
          return prev;
        }

        // Clean up comments - delete comment for deleted move
        const comments = new Map(prev.comments ?? new Map());
        comments.delete(deletedCommentKey);

        // Update chessRef to match the new position
        loadPositionFromPath(
          chessRef.current,
          treeCopy,
          newPath,
          prev.startingPosition,
          rootBranchesCopy,
        );

        return {
          ...prev,
          position: chess.fen(),
          moveTree: treeCopy,
          rootBranches: rootBranchesCopy,
          currentPath: newPath,
          comments,
        };
      });

      return true;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  }, [chessRef, gameState, getCommentKey, setGameState]);

  return undoMove;
};
