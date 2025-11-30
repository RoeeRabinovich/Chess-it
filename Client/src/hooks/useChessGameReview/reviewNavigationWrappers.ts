import type { ChessGameState } from "../../types/chess";
import type { UseChessNavigationReturn } from "../useChessGame/useChessNavigation";

interface ReviewNavigationWrappersParams {
  navigation: UseChessNavigationReturn;
  gameState: ChessGameState;
  onNavigationError?: (message: string) => void;
}

/**
 * Creates navigation wrapper functions with error handling for review mode
 */
export const createReviewNavigationWrappers = ({
  navigation,
  gameState,
  onNavigationError,
}: ReviewNavigationWrappersParams) => {
  const navigateToMove = (moveIndex: number) => {
    if (moveIndex < -1 || moveIndex >= gameState.moves.length) {
      onNavigationError?.(
        "Invalid move index. Please select a valid move from the move history.",
      );
      return;
    }

    try {
      navigation.navigateToMove(moveIndex);
    } catch (error) {
      console.error("Error navigating to move:", error);
      onNavigationError?.(
        "Failed to navigate to this move. The study data may be corrupted.",
      );
    }
  };

  const navigateToBranchMove = (branchId: string, moveIndexInBranch: number) => {
    const branch = gameState.branches.find((b) => b.id === branchId);
    if (!branch) {
      onNavigationError?.("Branch not found. This branch may have been removed.");
      return;
    }

    if (moveIndexInBranch < 0 || moveIndexInBranch >= branch.moves.length) {
      onNavigationError?.(
        "Invalid branch move index. Please select a valid move from the branch.",
      );
      return;
    }

    try {
      navigation.navigateToBranchMove(branchId, moveIndexInBranch);
    } catch (error) {
      console.error("Error navigating to branch move:", error);
      onNavigationError?.(
        "Failed to navigate to this branch move. The study data may be corrupted.",
      );
    }
  };

  const goToPreviousMove = () => {
    if (gameState.currentMoveIndex < 0) {
      return;
    }
    try {
      navigation.goToPreviousMove();
    } catch (error) {
      console.error("Error going to previous move:", error);
      onNavigationError?.("Failed to navigate to the previous move.");
    }
  };

  const goToNextMove = () => {
    if (gameState.currentMoveIndex >= gameState.moves.length - 1) {
      return;
    }
    try {
      navigation.goToNextMove();
    } catch (error) {
      console.error("Error going to next move:", error);
      onNavigationError?.("Failed to navigate to the next move.");
    }
  };

  return {
    navigateToMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
  };
};

