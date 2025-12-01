import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, MovePath } from "../../types/chess";
import { loadPositionFromPath } from "../../utils/moveTreeUtils";

interface UseTreeChessNavigationParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
}

export const useTreeChessNavigation = ({
  chessRef,
  gameState,
  setGameState,
}: UseTreeChessNavigationParams) => {
  const navigateToPath = useCallback(
    (path: MovePath) => {
      try {
        const success = loadPositionFromPath(
          chessRef.current,
          gameState.moveTree,
          path,
        );
        if (!success) {
          throw new Error("Failed to replay moves");
        }

        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          currentPath: path,
        }));
      } catch (error) {
        console.error("Error navigating to path:", error);
      }
    },
    [chessRef, gameState.moveTree, setGameState],
  );

  const navigateToMainLineMove = useCallback(
    (moveIndex: number) => {
      navigateToPath([moveIndex]);
    },
    [navigateToPath],
  );

  const navigateToBranchMove = useCallback(
    (path: MovePath) => {
      navigateToPath(path);
    },
    [navigateToPath],
  );

  const goToPreviousMove = useCallback(() => {
    const currentPath = gameState.currentPath;

    if (currentPath.length === 0) {
      return; // Already at start
    }

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
      // In a branch - go back one move
      const newPathArray = [...currentPath];
      const lastIndex = newPathArray[newPathArray.length - 1];
      if (lastIndex > 0) {
        newPathArray[newPathArray.length - 1] = lastIndex - 1;
        newPath = newPathArray;
      } else {
        // At start of branch - go back to parent
        newPath = newPathArray.slice(0, -2);
      }
    }

    navigateToPath(newPath);
  }, [gameState.currentPath, navigateToPath]);

  const goToNextMove = useCallback(() => {
    const currentPath = gameState.currentPath;
    const tree = gameState.moveTree;

    if (currentPath.length === 0) {
      // At start - go to first move if exists
      if (tree.length > 0) {
        navigateToPath([0]);
      }
      return;
    }

    // Calculate next path
    let newPath: MovePath;
    if (currentPath.length === 1) {
      // On main line
      const mainIndex = currentPath[0];
      if (mainIndex < tree.length - 1) {
        newPath = [mainIndex + 1];
      } else {
        // At end of main line - check for branches
        const node = tree[mainIndex];
        if (node.branches.length > 0) {
          newPath = [mainIndex, 0, 0];
        } else {
          return; // No next move
        }
      }
    } else {
      // In a branch
      const newPathArray = [...currentPath];
      const moveIndexInBranch = newPathArray[newPathArray.length - 1];
      const branchIndex = newPathArray[newPathArray.length - 2];
      const mainIndex = newPathArray[0];

      // Get the branch sequence
      const branchSequence = tree[mainIndex].branches[branchIndex];

      if (moveIndexInBranch < branchSequence.length - 1) {
        // More moves in this branch
        newPathArray[newPathArray.length - 1] = moveIndexInBranch + 1;
        newPath = newPathArray;
      } else {
        // At end of branch - check for nested branches
        const currentNode = branchSequence[moveIndexInBranch];
        if (currentNode.branches.length > 0) {
          newPath = [...newPathArray, 0, 0];
        } else {
          return; // No next move
        }
      }
    }

    navigateToPath(newPath);
  }, [gameState.currentPath, gameState.moveTree, navigateToPath]);

  return {
    navigateToPath,
    navigateToMainLineMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
  };
};
