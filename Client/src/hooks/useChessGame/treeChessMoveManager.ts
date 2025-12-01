import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove, MovePath } from "../../types/chess";
import { toChessMove, toMoveData } from "../../utils/chessMoveUtils";
import { addMoveToTree } from "../../utils/moveTreeUtils";
import {
  isAtEndOfPath,
  findMatchingBranchAtPath,
  handlePathContinuation,
  handleBranchNavigation,
  handleBranchCreation,
  loadPositionForPath,
} from "./treeMoveHandlers";

interface UseTreeChessMoveManagerParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  getCommentKey: (path: MovePath) => string;
}

export const useTreeChessMoveManager = ({
  chessRef,
  gameState,
  setGameState,
  getCommentKey,
}: UseTreeChessMoveManagerParams) => {
  const makeMove = useCallback(
    (move: ChessMove | { from: string; to: string; promotion?: string }) => {
      try {
        // IMPORTANT: The chess board component has its own chess instance and executes the move
        // before calling onMove. The move object passed here is already a valid ChessMove.
        // We need to:
        // 1. Load the correct position from the tree path into chessRef.current
        // 2. Execute the move on chessRef.current to verify it's valid and get the ChessMove object
        // 3. Add it to the tree
        
        const currentPath = gameState.currentPath;
        
        // Load the correct position from the tree path
        // This ensures chessRef.current is at the right position
        if (!loadPositionForPath(chessRef.current, gameState)) {
          console.error("Failed to load position for current path", {
            path: currentPath,
            treeLength: gameState.moveTree.length,
          });
          return false;
        }

        // Convert move to MoveData format for execution
        const moveData = toMoveData(move);
        
        // Execute the move on chessRef.current to verify it's valid
        // This also gives us the proper ChessMove object with all metadata
        const result = chessRef.current.move(moveData);
        if (!result) {
          console.error("Invalid move after loading position", {
            move: moveData,
            fen: chessRef.current.fen(),
            path: currentPath,
            turn: chessRef.current.turn(),
          });
          return false;
        }

        // Convert to ChessMove format
        const newMove = toChessMove(result);

        // Check if we're at the end of the current path
        const isAtEnd = isAtEndOfPath(gameState.moveTree, currentPath);

        if (isAtEnd) {
          // At the end - extend current path (main line or branch)
          return handlePathContinuation(
            chessRef.current,
            newMove,
            currentPath,
            setGameState,
          );
        }

        // Not at the end - we're in the middle of a sequence
        // This means user is trying to create a branch
        // Check if this move matches an existing branch's first move
        const matchingPath = findMatchingBranchAtPath(
          gameState.moveTree,
          currentPath,
          moveData,
        );

        if (matchingPath) {
          return handleBranchNavigation(
            chessRef.current,
            matchingPath,
            gameState,
            setGameState,
          );
        }

        // Create a new branch from the current position
        return handleBranchCreation(
          chessRef.current,
          newMove,
          currentPath,
          setGameState,
        );
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
        const currentPath = prev.currentPath;
        const commentKey = getCommentKey(currentPath);
        const comments = new Map(prev.comments ?? new Map());
        comments.delete(commentKey);

        // Calculate previous path
        let newPath: MovePath;
        if (currentPath.length === 1) {
          // On main line
          const mainIndex = currentPath[0];
          if (mainIndex > 0) {
            newPath = [mainIndex - 1];
          } else {
            newPath = [];
          }
        } else {
          // In a branch - go back one move in the branch
          const newPathArray = [...currentPath];
          const moveIndexInBranch = newPathArray[newPathArray.length - 1];
          if (moveIndexInBranch > 0) {
            newPathArray[newPathArray.length - 1] = moveIndexInBranch - 1;
            newPath = newPathArray;
          } else {
            // At start of branch - go back to parent
            newPath = newPathArray.slice(0, -2);
          }
        }

        return {
          ...prev,
          position: chessRef.current.fen(),
          currentPath: newPath,
          comments,
        };
      });

      return true;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  }, [chessRef, getCommentKey, setGameState]);

  return {
    makeMove,
    undoMove,
  };
};

