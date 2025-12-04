import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, MovePath } from "../../types/chess";
import {
  loadPositionFromPath,
  getBranchContextForPath,
} from "../../utils/moveTreeUtils";

interface UseTreeChessNavigationParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  startingPosition?: string; // Optional starting position (for review mode with custom starting positions)
}

export const useTreeChessNavigation = ({
  chessRef,
  gameState,
  setGameState,
  startingPosition,
}: UseTreeChessNavigationParams) => {
  // Determine the starting position to use
  // If provided explicitly, use it. Otherwise, use gameState.position when at start (for create mode)
  const effectiveStartingPosition =
    startingPosition ||
    (gameState.currentPath.length === 0 ? gameState.position : undefined) ||
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const navigateToPath = useCallback(
    (path: MovePath) => {
      try {
        const success = loadPositionFromPath(
          chessRef.current,
          gameState.moveTree,
          path,
          effectiveStartingPosition, // Use the effective starting position
          gameState.rootBranches,
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
    [
      chessRef,
      gameState.moveTree,
      gameState.rootBranches,
      effectiveStartingPosition,
      setGameState,
    ],
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
        if (newPath.length === 1 && newPath[0] === -1) {
          newPath = [];
        }
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
    if (currentPath.length === 1 && currentPath[0] >= 0) {
      // On main line
      const mainIndex = currentPath[0];
      if (mainIndex < tree.length - 1) {
        newPath = [mainIndex + 1];
      } else {
        const node = tree[mainIndex];
        if (node.branches.length > 0) {
          newPath = [mainIndex, 0, 0];
        } else {
          return;
        }
      }
    } else {
      const context = getBranchContextForPath(
        tree,
        gameState.rootBranches,
        currentPath,
      );

      if (!context) {
        return;
      }

      if (context.moveIndex < context.sequence.length - 1) {
        const nextPath = [...currentPath];
        nextPath[nextPath.length - 1] = context.moveIndex + 1;
        newPath = nextPath;
      } else if (context.node.branches.length > 0) {
        newPath = [...currentPath, 0, 0];
      } else {
        return;
      }
    }

    navigateToPath(newPath);
  }, [
    gameState.currentPath,
    gameState.moveTree,
    gameState.rootBranches,
    navigateToPath,
  ]);

  return {
    navigateToPath,
    navigateToMainLineMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
  };
};
