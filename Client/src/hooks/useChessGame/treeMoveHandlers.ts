import type { Chess } from "chess.js";
import type {
  ChessMove,
  ChessGameState,
  MovePath,
  MoveData,
  MoveNode,
} from "../../types/chess";
import {
  addMoveToTree,
  loadPositionFromPath,
  getBranchesAtPath,
  getBranchContextForPath,
  isRootBranchPath,
} from "../../utils/moveTreeUtils";

/**
 * Checks if we're at the end of the current path (can extend it)
 */
export const isAtEndOfPath = (
  tree: ChessGameState["moveTree"],
  rootBranches: MoveNode[][],
  path: MovePath,
): boolean => {
  if (path.length === 0) {
    // Empty path - at start, can add first move only if tree is empty
    return tree.length === 0;
  }

  if (isRootBranchPath(path)) {
    const context = getBranchContextForPath(tree, rootBranches, path);
    if (!context) {
      return true;
    }
    return context.moveIndex === context.sequence.length - 1;
  }

  // If on main line
  if (path.length === 1) {
    const mainIndex = path[0];
    return mainIndex === tree.length - 1;
  }

  const context = getBranchContextForPath(tree, rootBranches, path);
  if (!context) {
    return true;
  }

  return context.moveIndex === context.sequence.length - 1;
};

/**
 * Determines the next move path when following the current line (main or branch)
 */
export const getContinuationPath = (
  tree: ChessGameState["moveTree"],
  rootBranches: MoveNode[][],
  path: MovePath,
): MovePath | null => {
  if (path.length === 0) {
    return tree.length > 0 ? [0] : null;
  }

  if (isRootBranchPath(path)) {
    const context = getBranchContextForPath(tree, rootBranches, path);
    if (!context) {
      return null;
    }

    if (context.moveIndex < context.sequence.length - 1) {
      const nextPath = [...path];
      nextPath[nextPath.length - 1] = context.moveIndex + 1;
      return nextPath;
    }

    return null;
  }

  if (path.length === 1) {
    const mainIndex = path[0];
    if (mainIndex < 0 || mainIndex >= tree.length - 1) {
      return null;
    }
    return [mainIndex + 1];
  }

  const context = getBranchContextForPath(tree, rootBranches, path);
  if (!context) {
    return null;
  }

  if (context.moveIndex < context.sequence.length - 1) {
    const nextPath = [...path];
    nextPath[nextPath.length - 1] = context.moveIndex + 1;
    return nextPath;
  }

  return null;
};

/**
 * Checks if a move matches the first move of any branch at the current path
 */
export const findMatchingBranchAtPath = (
  tree: ChessGameState["moveTree"],
  rootBranches: MoveNode[][],
  path: MovePath,
  moveData: MoveData,
): MovePath | null => {
  const branches = getBranchesAtPath(tree, path, rootBranches);

  for (let i = 0; i < branches.length; i++) {
    const branchSequence = branches[i];
    if (branchSequence.length > 0) {
      const firstMove = branchSequence[0].move;
      if (
        firstMove.from === moveData.from &&
        firstMove.to === moveData.to &&
        (firstMove.promotion || "") === (moveData.promotion || "")
      ) {
        // Found matching branch - return path to first move in that branch
        return [...path, i, 0];
      }
    }
  }

  return null;
};

/**
 * Handles continuing/extending the current path
 * NOTE: The move has already been executed on the chess instance
 */
export const handlePathContinuation = (
  chess: Chess,
  newMove: ChessMove,
  currentPath: MovePath,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
): boolean => {
  setGameState((prev) => {
    // Create a deep copy of the tree to avoid mutation issues
    const treeCopy = JSON.parse(
      JSON.stringify(prev.moveTree),
    ) as typeof prev.moveTree;
    const rootBranchesCopy = JSON.parse(
      JSON.stringify(prev.rootBranches || []),
    ) as MoveNode[][];
    const { newPath } = addMoveToTree(
      treeCopy,
      rootBranchesCopy,
      currentPath,
      newMove,
    );

    return {
      ...prev,
      position: chess.fen(),
      moveTree: treeCopy,
      rootBranches: rootBranchesCopy,
      currentPath: newPath,
    };
  });

  return true;
};

/**
 * Handles navigating to an existing branch
 */
export const handleBranchNavigation = (
  chess: Chess,
  targetPath: MovePath,
  gameState: ChessGameState,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
): boolean => {
  const success = loadPositionFromPath(
    chess,
    gameState.moveTree,
    targetPath,
    undefined,
    gameState.rootBranches,
  );
  if (!success) {
    return false;
  }

  setGameState((prev) => ({
    ...prev,
    position: chess.fen(),
    currentPath: targetPath,
  }));

  return true;
};

/**
 * Handles creating a new branch
 * NOTE: The move has already been executed on the chess instance
 */
export const handleBranchCreation = (
  chess: Chess,
  newMove: ChessMove,
  currentPath: MovePath,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
): boolean => {
  setGameState((prev) => {
    // Create a deep copy to avoid mutation issues
    const treeCopy = JSON.parse(
      JSON.stringify(prev.moveTree),
    ) as typeof prev.moveTree;
    const rootBranchesCopy = JSON.parse(
      JSON.stringify(prev.rootBranches || []),
    ) as MoveNode[][];
    const { newPath } = addMoveToTree(
      treeCopy,
      rootBranchesCopy,
      currentPath,
      newMove,
    );

    return {
      ...prev,
      position: chess.fen(),
      moveTree: treeCopy,
      rootBranches: rootBranchesCopy,
      currentPath: newPath,
    };
  });

  return true;
};

/**
 * Loads the chess position for the current path
 * This ensures the chess instance matches the tree state
 */
export const loadPositionForPath = (
  chess: Chess,
  gameState: ChessGameState,
): boolean => {
  // Always load from the tree path to ensure consistency
  // The gameState.position might be out of sync with the path
  return loadPositionFromPath(
    chess,
    gameState.moveTree,
    gameState.currentPath,
    gameState.startingPosition,
    gameState.rootBranches,
  );
};
