import type { Chess } from "chess.js";
import type { ChessMove, MoveNode, MovePath } from "../types/chess";
import { replayMoves } from "./chessMoveUtils";

/**
 * Converts a MovePath to a string key for comments/storage
 */
export const pathToString = (path: MovePath): string => {
  return path.join("-");
};

/**
 * Parses a string key back to a MovePath
 */
export const pathFromString = (str: string): MovePath => {
  return str.split("-").map(Number);
};

/**
 * Gets the node at the given path in the tree
 * Path format: [mainMoveIndex, branchIndex?, moveIndexInBranch?, branchIndex?, ...]
 */
export const getNodeAtPath = (
  tree: MoveNode[],
  path: MovePath,
): MoveNode | null => {
  if (path.length === 0) {
    return null;
  }

  // First segment is always a main line move index
  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    return null;
  }

  let currentNode = tree[mainIndex];

  // Process remaining path segments in pairs: [branchIndex, moveIndexInBranch]
  for (let i = 1; i < path.length; i += 2) {
    const branchIndex = path[i];
    const moveIndexInBranch = path[i + 1];

    if (branchIndex === undefined || moveIndexInBranch === undefined) {
      // Incomplete path - return current node
      return currentNode;
    }

    // Get the branch sequence
    if (branchIndex < 0 || branchIndex >= currentNode.branches.length) {
      return null;
    }
    const branchSequence = currentNode.branches[branchIndex];

    // Get the move within that branch
    if (moveIndexInBranch < 0 || moveIndexInBranch >= branchSequence.length) {
      return null;
    }
    currentNode = branchSequence[moveIndexInBranch];
  }

  return currentNode;
};

/**
 * Gets all moves along a path (for replaying)
 * This replays ALL moves up to and including the path position
 *
 * Key insight: Branches are stored on the move node AFTER which they start.
 * So if a branch is stored on tree[mainIndex], it starts from the position AFTER mainIndex's move.
 */
export const getMovesAlongPath = (
  tree: MoveNode[],
  path: MovePath,
): ChessMove[] => {
  const moves: ChessMove[] = [];

  if (path.length === 0) {
    return moves; // At starting position
  }

  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    return moves;
  }

  // If path is just [mainIndex], we're on main line - replay all moves up to and including mainIndex
  if (path.length === 1) {
    for (let i = 0; i <= mainIndex && i < tree.length; i++) {
      moves.push(tree[i].move);
    }
    return moves;
  }

  // We're in a branch
  // Path format: [mainIndex, branchIndex, moveIndexInBranch, ...]
  // The branch is stored on tree[mainIndex], meaning it starts AFTER mainIndex's move
  // So we replay: all moves up to and including mainIndex, then branch moves

  // Replay all main line moves up to and including mainIndex
  for (let i = 0; i <= mainIndex && i < tree.length; i++) {
    moves.push(tree[i].move);
  }

  // Now add branch moves
  let currentNode = tree[mainIndex];
  let pathIndex = 1;

  while (pathIndex < path.length) {
    const branchIndex = path[pathIndex];
    const moveIndexInBranch = path[pathIndex + 1];

    if (branchIndex === undefined || moveIndexInBranch === undefined) {
      break;
    }

    // Get the branch sequence
    if (branchIndex < 0 || branchIndex >= currentNode.branches.length) {
      break;
    }
    const branchSequence = currentNode.branches[branchIndex];

    // Add all moves in the branch up to moveIndexInBranch (inclusive)
    for (let j = 0; j <= moveIndexInBranch && j < branchSequence.length; j++) {
      moves.push(branchSequence[j].move);
    }

    // Update current node for potential deeper nesting
    if (moveIndexInBranch >= 0 && moveIndexInBranch < branchSequence.length) {
      currentNode = branchSequence[moveIndexInBranch];
    } else {
      break;
    }

    pathIndex += 2; // Move to next pair [branchIndex, moveIndex]
  }

  return moves;
};

/**
 * Loads a chess position by replaying moves along a path
 */
export const loadPositionFromPath = (
  chess: Chess,
  tree: MoveNode[],
  path: MovePath,
): boolean => {
  chess.reset();
  const moves = getMovesAlongPath(tree, path);
  return replayMoves(chess, moves, moves.length);
};

/**
 * Adds a move to the tree at the given path
 *
 * Key design: Branches are stored on the move node AFTER which they start.
 * So if you're at move 1 (index 1) and create a branch, the branch is stored on tree[1],
 * meaning it's an alternative continuation from the position AFTER move 1.
 */
export const addMoveToTree = (
  tree: MoveNode[],
  path: MovePath,
  move: ChessMove,
): { newPath: MovePath; isNewBranch: boolean } => {
  if (path.length === 0) {
    // Adding to empty tree
    const newNode: MoveNode = { move, branches: [] };
    tree.push(newNode);
    return { newPath: [0], isNewBranch: false };
  }

  // Check if we're extending the main line
  if (path.length === 1) {
    const mainIndex = path[0];
    // Check if we're at the end of main line
    if (mainIndex === tree.length - 1) {
      // Extend main line
      const newNode: MoveNode = { move, branches: [] };
      tree.push(newNode);
      return { newPath: [tree.length - 1], isNewBranch: false };
    }
    // Not at end - create a branch from this main line move
    // The branch is stored on mainIndex, meaning it starts AFTER mainIndex's move
    const currentNode = tree[mainIndex];
    const newBranch: MoveNode[] = [{ move, branches: [] }];
    currentNode.branches.push(newBranch);
    const branchIndex = currentNode.branches.length - 1;
    return { newPath: [mainIndex, branchIndex, 0], isNewBranch: true };
  }

  // We're in a branch - get the current node
  const currentNode = getNodeAtPath(tree, path);
  if (!currentNode) {
    throw new Error("Invalid path: node not found");
  }

  // Check if we're at the end of a branch sequence
  // Path format: [mainIndex, branchIndex, moveIndexInBranch, ...]
  const mainIndex = path[0];
  const branchIndex = path[1];
  const moveIndexInBranch = path[2];

  if (path.length === 3) {
    // We're at a specific move in a branch
    const branchSequence = tree[mainIndex].branches[branchIndex];
    if (moveIndexInBranch === branchSequence.length - 1) {
      // At the end of this branch - extend it
      const newNode: MoveNode = { move, branches: [] };
      branchSequence.push(newNode);
      return {
        newPath: [mainIndex, branchIndex, branchSequence.length - 1],
        isNewBranch: false,
      };
    }
    // Not at end - create a nested branch from this branch move
    const newBranch: MoveNode[] = [{ move, branches: [] }];
    currentNode.branches.push(newBranch);
    const newBranchIndex = currentNode.branches.length - 1;
    return {
      newPath: [...path, newBranchIndex, 0],
      isNewBranch: true,
    };
  }

  // Deeper nesting - similar logic
  const newBranch: MoveNode[] = [{ move, branches: [] }];
  currentNode.branches.push(newBranch);
  const newBranchIndex = currentNode.branches.length - 1;
  return {
    newPath: [...path, newBranchIndex, 0],
    isNewBranch: true,
  };
};

/**
 * Gets the main line moves from the tree
 */
export const getMainLineMoves = (tree: MoveNode[]): ChessMove[] => {
  return tree.map((node) => node.move);
};

/**
 * Calculates the absolute move index in the game sequence for a given path
 * This counts all moves along the path (main line + all branch moves)
 * Returns the 0-based index (0 = first move, 1 = second move, etc.)
 */
export const getAbsoluteMoveIndex = (
  tree: MoveNode[],
  path: MovePath,
): number => {
  if (path.length === 0) {
    return -1; // Starting position
  }

  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    return -1;
  }

  // Start with main line moves up to and including mainIndex
  let absoluteIndex = mainIndex;

  // If we're in a branch, add the branch moves
  if (path.length > 1) {
    let currentNode = tree[mainIndex];
    let pathIndex = 1;

    while (pathIndex < path.length) {
      const branchIndex = path[pathIndex];
      const moveIndexInBranch = path[pathIndex + 1];

      if (branchIndex === undefined || moveIndexInBranch === undefined) {
        break;
      }

      // Get the branch sequence
      if (branchIndex < 0 || branchIndex >= currentNode.branches.length) {
        break;
      }
      const branchSequence = currentNode.branches[branchIndex];

      // Add moves in this branch up to moveIndexInBranch (inclusive)
      // The branch starts AFTER the current position, so we add moveIndexInBranch + 1 moves
      absoluteIndex += moveIndexInBranch + 1;

      // Update current node for deeper nesting
      if (moveIndexInBranch >= 0 && moveIndexInBranch < branchSequence.length) {
        currentNode = branchSequence[moveIndexInBranch];
      } else {
        break;
      }

      pathIndex += 2; // Move to next pair [branchIndex, moveIndex]
    }
  }

  return absoluteIndex;
};

/**
 * Finds all branches at a specific path (alternative move sequences from that position)
 */
export const getBranchesAtPath = (
  tree: MoveNode[],
  path: MovePath,
): MoveNode[][] => {
  const node = getNodeAtPath(tree, path);
  return node ? node.branches : [];
};

/**
 * Gets the depth of nesting for a path
 */
export const getPathDepth = (path: MovePath): number => {
  // Depth = number of branch segments (every 2 segments after the first)
  return Math.floor((path.length - 1) / 2);
};

/**
 * Checks if a path is on the main line
 */
export const isMainLinePath = (path: MovePath): boolean => {
  return path.length === 1;
};
