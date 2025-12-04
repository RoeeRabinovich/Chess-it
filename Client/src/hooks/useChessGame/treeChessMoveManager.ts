import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove } from "../../types/chess";
import { toChessMove, toMoveData } from "../../utils/chessMoveUtils";
import { getNodeAtPath } from "../../utils/moveTreeUtils";
import {
  isAtEndOfPath,
  findMatchingBranchAtPath,
  handlePathContinuation,
  handleBranchNavigation,
  handleBranchCreation,
  loadPositionForPath,
  getContinuationPath,
} from "./treeMoveHandlers";

interface UseTreeChessMoveManagerParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
}

const movesMatch = (
  existingMove: ChessMove | null,
  moveData: { from: string; to: string; promotion?: string },
) => {
  if (!existingMove) {
    return false;
  }

  return (
    existingMove.from === moveData.from &&
    existingMove.to === moveData.to &&
    (existingMove.promotion || "") === (moveData.promotion || "")
  );
};

export const useTreeChessMoveManager = ({
  chessRef,
  gameState,
  setGameState,
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

        // Determine if this move continues the existing line
        const continuationPath = getContinuationPath(
          gameState.moveTree,
          gameState.rootBranches,
          currentPath,
        );

        if (continuationPath) {
          const continuationNode = getNodeAtPath(
            gameState.moveTree,
            continuationPath,
            gameState.rootBranches,
          );

          if (movesMatch(continuationNode?.move ?? null, moveData)) {
            return handleBranchNavigation(
              chessRef.current,
              continuationPath,
              gameState,
              setGameState,
            );
          }
        }

        // Check if we're at the end of the current path
        const isAtEnd = isAtEndOfPath(
          gameState.moveTree,
          gameState.rootBranches,
          currentPath,
        );

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
          gameState.rootBranches,
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

  return {
    makeMove,
  };
};
