import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove, MoveData } from "../../types/chess";
import { toMoveData } from "../../utils/chessMoveUtils";
import { getMainLineMoves, getMovesAlongPath, loadPositionFromPath } from "../../utils/moveTreeUtils";

interface ReviewMoveHandlersParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  onInvalidMove?: (message: string) => void;
}

/**
 * Validates and executes a move in review mode
 * Only allows moves that match the study's move history
 */
export const makeReviewMove = ({
  chessRef,
  gameState,
  setGameState,
  onInvalidMove,
}: ReviewMoveHandlersParams) => {
  return (move: ChessMove | MoveData): boolean => {
    try {
      const moveData = toMoveData(move);
      const currentPath = gameState.currentPath;
      const mainLineMoves = getMainLineMoves(gameState.moveTree);

      // Calculate next path
      let nextPath: number[];
      if (currentPath.length === 0) {
        // At start - next move is [0]
        nextPath = [0];
      } else if (currentPath.length === 1) {
        // On main line - next move is [mainIndex + 1]
        const mainIndex = currentPath[0];
        nextPath = [mainIndex + 1];
      } else {
        // In a branch - this is more complex, for now just check main line continuation
        const mainIndex = currentPath[0];
        nextPath = [mainIndex + 1];
      }

      // Check if we've reached the end
      if (nextPath[0] >= mainLineMoves.length) {
        onInvalidMove?.(
          "You've reached the end of this study. No more moves available.",
        );
        return false;
      }

      // Get expected move from tree
      const expectedMove = mainLineMoves[nextPath[0]];
      const matchesExpected =
        moveData.from === expectedMove.from &&
        moveData.to === expectedMove.to &&
        (moveData.promotion || "") === (expectedMove.promotion || "");

      if (!matchesExpected) {
        onInvalidMove?.(
          `This move is not part of the study. The next move should be ${expectedMove.san}.`,
        );
        return false;
      }

      // Load position from current path
      if (!loadPositionFromPath(chessRef.current, gameState.moveTree, currentPath)) {
        onInvalidMove?.("Failed to load current position.");
        return false;
      }

      // Execute the move
      const result = chessRef.current.move(moveData);
      if (!result) {
        return false;
      }

      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentPath: nextPath,
      }));

      return true;
    } catch (error) {
      console.error("Invalid move:", error);
      return false;
    }
  };
};

/**
 * Undoes a move in review mode
 */
export const undoReviewMove = ({
  chessRef,
  gameState,
  setGameState,
}: ReviewMoveHandlersParams) => {
  return (): boolean => {
    const currentPath = gameState.currentPath;
    
    if (currentPath.length === 0) {
      return false; // Already at start
    }

    try {
      // Calculate previous path
      let newPath: number[];
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

      // Load position from new path
      if (!loadPositionFromPath(chessRef.current, gameState.moveTree, newPath)) {
        return false;
      }

      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentPath: newPath,
      }));

      return true;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  };
};

