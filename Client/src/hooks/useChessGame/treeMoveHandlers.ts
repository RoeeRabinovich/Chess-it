import type { Chess } from "chess.js";
import type { ChessMove, ChessGameState, MovePath, MoveData } from "../../types/chess";
import { toChessMove } from "../../utils/chessMoveUtils";
import {
  addMoveToTree,
  loadPositionFromPath,
  getNodeAtPath,
  getBranchesAtPath,
} from "../../utils/moveTreeUtils";

/**
 * Checks if we're at the end of the current path (can extend it)
 */
export const isAtEndOfPath = (
  tree: ChessGameState["moveTree"],
  path: MovePath,
): boolean => {
  if (path.length === 0) {
    // Empty path - at start, can add first move
    return true;
  }

  // If on main line
  if (path.length === 1) {
    const mainIndex = path[0];
    return mainIndex === tree.length - 1;
  }

  // In a branch - check if at the end of the branch sequence
  // Path format: [mainIndex, branchIndex, moveIndexInBranch, ...]
  const mainIndex = path[0];
  const branchIndex = path[1];
  const moveIndexInBranch = path[2];

  if (
    mainIndex === undefined ||
    branchIndex === undefined ||
    moveIndexInBranch === undefined
  ) {
    return false;
  }

  // Get the branch sequence
  if (mainIndex >= tree.length) {
    return false;
  }
  const mainNode = tree[mainIndex];
  if (branchIndex >= mainNode.branches.length) {
    return false;
  }
  const branchSequence = mainNode.branches[branchIndex];

  // Check if at the end of this branch sequence
  if (moveIndexInBranch < branchSequence.length - 1) {
    return false;
  }

  // At end of branch - check if there are deeper paths
  if (path.length > 3) {
    // Deeper nesting - recurse
    return isAtEndOfPath(tree, path.slice(2));
  }

  return true;
};

/**
 * Checks if a move matches the first move of any branch at the current path
 */
export const findMatchingBranchAtPath = (
  tree: ChessGameState["moveTree"],
  path: MovePath,
  moveData: MoveData,
): MovePath | null => {
  const branches = getBranchesAtPath(tree, path);
  
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
 */
export const handlePathContinuation = (
  chess: Chess,
  moveData: MoveData,
  currentPath: MovePath,
  gameState: ChessGameState,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
): boolean => {
  // CRITICAL: Load position from path BEFORE making the move
  // The chess instance must be at the exact position of the current path
  if (!loadPositionFromPath(chess, gameState.moveTree, currentPath)) {
    console.error("Failed to load position for path continuation", {
      path: currentPath,
      treeLength: gameState.moveTree.length,
    });
    return false;
  }

  // Verify the position matches what we expect
  const expectedFen = gameState.position;
  const actualFen = chess.fen();
  if (actualFen !== expectedFen) {
    console.warn("Position mismatch after loading path", {
      expected: expectedFen,
      actual: actualFen,
      path: currentPath,
    });
    // Use the loaded position (it's more accurate)
  }

  // Now make the move
  const result = chess.move(moveData);
  if (!result) {
    console.error("Invalid move after loading position", {
      move: moveData,
      fen: chess.fen(),
      path: currentPath,
    });
    return false;
  }

  const newMove = toChessMove(result);
  setGameState((prev) => {
    // Create a deep copy of the tree to avoid mutation issues
    const treeCopy = JSON.parse(JSON.stringify(prev.moveTree)) as typeof prev.moveTree;
    const { newPath } = addMoveToTree(treeCopy, currentPath, newMove);
    
    return {
      ...prev,
      position: chess.fen(),
      moveTree: treeCopy,
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
  const success = loadPositionFromPath(chess, gameState.moveTree, targetPath);
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
 */
export const handleBranchCreation = (
  chess: Chess,
  moveData: MoveData,
  currentPath: MovePath,
  gameState: ChessGameState,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
): boolean => {
  // CRITICAL: Load position from path BEFORE making the move
  if (!loadPositionFromPath(chess, gameState.moveTree, currentPath)) {
    console.error("Failed to load position for branch creation", {
      path: currentPath,
      treeLength: gameState.moveTree.length,
    });
    return false;
  }

  const result = chess.move(moveData);
  if (!result) {
    console.error("Invalid move for branch creation", {
      move: moveData,
      fen: chess.fen(),
      path: currentPath,
    });
    return false;
  }

  const newMove = toChessMove(result);
  setGameState((prev) => {
    // Create a deep copy to avoid mutation issues
    const treeCopy = JSON.parse(JSON.stringify(prev.moveTree)) as typeof prev.moveTree;
    const { newPath, isNewBranch } = addMoveToTree(treeCopy, currentPath, newMove);
    
    return {
      ...prev,
      position: chess.fen(),
      moveTree: treeCopy,
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
  return loadPositionFromPath(chess, gameState.moveTree, gameState.currentPath);
};

