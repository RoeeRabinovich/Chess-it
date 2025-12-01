import { useEffect, useRef } from "react";
import { Study } from "../../../types/study";
import { MoveNode, MovePath } from "../../../types/chess";

interface UseAutoNavigateToFirstMoveProps {
  study: Study | null;
  chessGameReview: {
    gameState: {
      moveTree: MoveNode[];
      currentPath: MovePath;
    };
    navigateToMove: (index: number) => void;
  };
}

export const useAutoNavigateToFirstMove = ({
  study,
  chessGameReview,
}: UseAutoNavigateToFirstMoveProps) => {
  // Auto-navigate to first move when study loads
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    // Reset navigation flag when study changes
    if (study) {
      hasNavigatedRef.current = false;
    }
  }, [study]);

  useEffect(() => {
    if (
      study &&
      !hasNavigatedRef.current &&
      chessGameReview.gameState.moveTree &&
      chessGameReview.gameState.moveTree.length > 0 &&
      chessGameReview.gameState.currentPath.length === 0
    ) {
      // Study has moves but is at starting position - navigate to first move of main line
      chessGameReview.navigateToMove(0);
      hasNavigatedRef.current = true;
    }
  }, [
    study,
    chessGameReview.gameState.moveTree,
    chessGameReview.gameState.currentPath,
    chessGameReview,
  ]);
};
