import { useCallback } from "react";

import type { Chess } from "chess.js";

import type { BranchContext, ChessGameState } from "../../types/chess";
import { loadBranchPosition, loadPositionFromMoves } from "../../utils/chessBranchUtils";

interface UseChessNavigationParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  setCurrentBranchContext: React.Dispatch<React.SetStateAction<BranchContext | null>>;
}

export const useChessNavigation = ({
  chessRef,
  gameState,
  setGameState,
  setCurrentBranchContext,
}: UseChessNavigationParams) => {
  const navigateToMove = useCallback(
    (moveIndex: number) => {
      try {
        const success = loadPositionFromMoves(chessRef.current, gameState.moves, moveIndex);
        if (!success) {
          throw new Error("Failed to replay moves");
        }

        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          currentMoveIndex: moveIndex,
        }));
        setCurrentBranchContext(null);
      } catch (error) {
        console.error("Error navigating to move:", error);
      }
    },
    [chessRef, gameState.moves, setCurrentBranchContext, setGameState],
  );

  const navigateToBranchMove = useCallback(
    (branchId: string, moveIndexInBranch: number) => {
      try {
        const branch = gameState.branches.find((b) => b.id === branchId);
        if (!branch) {
          return;
        }

        const success = loadBranchPosition(
          chessRef.current,
          gameState.moves,
          branch,
          moveIndexInBranch,
        );
        if (!success) {
          throw new Error("Failed to replay branch moves");
        }

        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          currentMoveIndex: branch.startIndex - 1,
        }));
        setCurrentBranchContext({ branchId, moveIndexInBranch });
      } catch (error) {
        console.error("Error navigating to branch move:", error);
      }
    },
    [chessRef, gameState.branches, gameState.moves, setCurrentBranchContext, setGameState],
  );

  const goToPreviousMove = useCallback(() => {
    if (gameState.currentMoveIndex >= 0) {
      navigateToMove(gameState.currentMoveIndex - 1);
    }
  }, [gameState.currentMoveIndex, navigateToMove]);

  const goToNextMove = useCallback(() => {
    if (gameState.currentMoveIndex < gameState.moves.length - 1) {
      navigateToMove(gameState.currentMoveIndex + 1);
    }
  }, [gameState.currentMoveIndex, gameState.moves.length, navigateToMove]);

  return {
    navigateToMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
  };
};
