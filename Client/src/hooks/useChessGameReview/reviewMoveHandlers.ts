import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove, MoveData } from "../../types/chess";
import { toMoveData } from "../../utils/chessMoveUtils";

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
      const nextMoveIndex = gameState.currentMoveIndex + 1;

      if (nextMoveIndex >= gameState.moves.length) {
        onInvalidMove?.(
          "You've reached the end of this study. No more moves available.",
        );
        return false;
      }

      const expectedMove = gameState.moves[nextMoveIndex];
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

      const result = chessRef.current.move(moveData);
      if (!result) {
        return false;
      }

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
  };
};

