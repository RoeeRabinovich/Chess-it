import type { Chess } from "chess.js";
import type { ChessMove, MoveNode, MovePath } from "../types/chess";
import { replayMoves } from "./chessMoveUtils";

export const ROOT_PATH_INDEX = -1;

export const isRootBranchPath = (path: MovePath): boolean =>
  path.length > 0 && path[0] === ROOT_PATH_INDEX;

const traverseBranchSegments = (
  initialBranches: MoveNode[][],
  segments: number[],
): { sequence: MoveNode[]; moveIndex: number; node: MoveNode } | null => {
  let branches = initialBranches;
  let sequence: MoveNode[] | null = null;
  let node: MoveNode | null = null;

  for (let i = 0; i < segments.length; i += 2) {
    const branchIndex = segments[i];
    const moveIndex = segments[i + 1];

    if (branchIndex === undefined || moveIndex === undefined) {
      return null;
    }

    sequence = branches[branchIndex];
    if (!sequence || moveIndex < 0 || moveIndex >= sequence.length) {
      return null;
    }

    node = sequence[moveIndex];

    if (i + 2 >= segments.length) {
      return {
        sequence,
        moveIndex,
        node,
      };
    }

    branches = node.branches;
  }

  return null;
};

const appendBranchMoves = (
  initialBranches: MoveNode[][],
  segments: number[],
  moves: ChessMove[],
) => {
  let branches = initialBranches;

  for (let i = 0; i < segments.length; i += 2) {
    const branchIndex = segments[i];
    const moveIndex = segments[i + 1];

    if (branchIndex === undefined || moveIndex === undefined) {
      break;
    }

    const branchSequence = branches[branchIndex];
    if (!branchSequence) {
      break;
    }

    for (let j = 0; j <= moveIndex && j < branchSequence.length; j++) {
      moves.push(branchSequence[j].move);
    }

    const node = branchSequence[moveIndex];
    if (!node) {
      break;
    }

    branches = node.branches;
  }
};

const getAbsoluteIndexWithinBranches = (
  initialBranches: MoveNode[][],
  segments: number[],
  startingIndex: number,
): number => {
  let absoluteIndex = startingIndex;
  let branches = initialBranches;

  for (let i = 0; i < segments.length; i += 2) {
    const branchIndex = segments[i];
    const moveIndex = segments[i + 1];

    if (branchIndex === undefined || moveIndex === undefined) {
      return absoluteIndex;
    }

    const branchSequence = branches[branchIndex];
    if (
      !branchSequence ||
      moveIndex < 0 ||
      moveIndex >= branchSequence.length
    ) {
      return -1;
    }

    absoluteIndex += moveIndex + 1;
    const node = branchSequence[moveIndex];
    branches = node.branches;
  }

  return absoluteIndex;
};

export const getBranchContextForPath = (
  tree: MoveNode[],
  rootBranches: MoveNode[][],
  path: MovePath,
): { sequence: MoveNode[]; moveIndex: number; node: MoveNode } | null => {
  if (isRootBranchPath(path)) {
    return traverseBranchSegments(rootBranches, path.slice(1));
  }

  if (path.length < 3) {
    return null;
  }

  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    return null;
  }

  return traverseBranchSegments(tree[mainIndex].branches, path.slice(1));
};

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
  rootBranches: MoveNode[][] = [],
): MoveNode | null => {
  if (path.length === 0) {
    return null;
  }

  if (isRootBranchPath(path)) {
    let branches = rootBranches;
    let currentNode: MoveNode | null = null;

    for (let i = 1; i < path.length; i += 2) {
      const branchIndex = path[i];
      const moveIndexInBranch = path[i + 1];

      if (branchIndex === undefined || moveIndexInBranch === undefined) {
        return currentNode;
      }

      if (branchIndex < 0 || branchIndex >= branches.length) {
        return null;
      }

      const branchSequence = branches[branchIndex];
      if (moveIndexInBranch < 0 || moveIndexInBranch >= branchSequence.length) {
        return null;
      }

      currentNode = branchSequence[moveIndexInBranch];
      branches = currentNode.branches;
    }

    return currentNode;
  }

  // First segment is main line move index
  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    return null;
  }

  let currentNode = tree[mainIndex];

  if (path.length === 1) {
    return currentNode;
  }

  let branches = currentNode.branches;

  // Process remaining path segments in pairs: [branchIndex, moveIndexInBranch]
  for (let i = 1; i < path.length; i += 2) {
    const branchIndex = path[i];
    const moveIndexInBranch = path[i + 1];

    if (branchIndex === undefined || moveIndexInBranch === undefined) {
      // Incomplete path - return current node
      return currentNode;
    }

    // Get the branch sequence
    if (branchIndex < 0 || branchIndex >= branches.length) {
      return null;
    }
    const branchSequence = branches[branchIndex];

    // Get the move within that branch
    if (moveIndexInBranch < 0 || moveIndexInBranch >= branchSequence.length) {
      return null;
    }
    currentNode = branchSequence[moveIndexInBranch];
    branches = currentNode.branches;
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
  rootBranches: MoveNode[][] = [],
): ChessMove[] => {
  const moves: ChessMove[] = [];

  if (path.length === 0) {
    return moves; // At starting position
  }

  if (isRootBranchPath(path)) {
    appendBranchMoves(rootBranches, path.slice(1), moves);
    return moves;
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
  appendBranchMoves(tree[mainIndex].branches, path.slice(1), moves);

  return moves;
};

/**
 * Loads a chess position by replaying moves along a path
 * @param chess - The chess instance
 * @param tree - The move tree
 * @param path - The path to navigate to
 * @param startingPosition - Optional starting FEN position (defaults to standard starting position)
 */
export const loadPositionFromPath = (
  chess: Chess,
  tree: MoveNode[],
  path: MovePath,
  startingPosition?: string,
  rootBranches: MoveNode[][] = [],
): boolean => {
  // Load the starting position instead of resetting to default
  const defaultPosition =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const position = startingPosition || defaultPosition;

  try {
    chess.load(position);
  } catch (error) {
    // If loading fails, fall back to reset
    console.warn("Failed to load starting position, using default:", error);
    chess.reset();
  }

  const moves = getMovesAlongPath(tree, path, rootBranches);
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
  rootBranches: MoveNode[][],
  path: MovePath,
  move: ChessMove,
): { newPath: MovePath; isNewBranch: boolean } => {
  if (path.length === 0) {
    if (tree.length === 0) {
      const newNode: MoveNode = { move, branches: [] };
      tree.push(newNode);
      return { newPath: [0], isNewBranch: false };
    }

    const newBranch: MoveNode[] = [{ move, branches: [] }];
    rootBranches.push(newBranch);
    const branchIndex = rootBranches.length - 1;
    return {
      newPath: [ROOT_PATH_INDEX, branchIndex, 0],
      isNewBranch: true,
    };
  }

  if (isRootBranchPath(path)) {
    const branchContext = traverseBranchSegments(rootBranches, path.slice(1));
    if (!branchContext) {
      throw new Error("Invalid root branch path: node not found");
    }

    const { sequence, moveIndex, node } = branchContext;

    if (moveIndex === sequence.length - 1) {
      const newNode: MoveNode = { move, branches: [] };
      sequence.push(newNode);
      const newPath = [...path];
      newPath[newPath.length - 1] = sequence.length - 1;
      return { newPath, isNewBranch: false };
    }

    const newBranch: MoveNode[] = [{ move, branches: [] }];
    node.branches.push(newBranch);
    const newBranchIndex = node.branches.length - 1;
    return {
      newPath: [...path, newBranchIndex, 0],
      isNewBranch: true,
    };
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
  const currentNode = getNodeAtPath(tree, path, rootBranches);
  if (!currentNode) {
    throw new Error("Invalid path: node not found");
  }

  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    throw new Error("Invalid main line index in path");
  }

  const branchContext = traverseBranchSegments(
    tree[mainIndex].branches,
    path.slice(1),
  );

  if (!branchContext) {
    throw new Error("Invalid branch path: node not found");
  }

  const { sequence, moveIndex, node } = branchContext;

  if (moveIndex === sequence.length - 1) {
    const newNode: MoveNode = { move, branches: [] };
    sequence.push(newNode);
    const newPath = [...path];
    newPath[newPath.length - 1] = sequence.length - 1;
    return { newPath, isNewBranch: false };
  }

  const newBranch: MoveNode[] = [{ move, branches: [] }];
  node.branches.push(newBranch);
  const newBranchIndex = node.branches.length - 1;
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
  rootBranches: MoveNode[][] = [],
): number => {
  if (path.length === 0) {
    return -1; // Starting position
  }

  if (isRootBranchPath(path)) {
    return getAbsoluteIndexWithinBranches(rootBranches, path.slice(1), -1);
  }

  const mainIndex = path[0];
  if (mainIndex < 0 || mainIndex >= tree.length) {
    return -1;
  }

  // Start with main line moves up to and including mainIndex
  const absoluteIndex = mainIndex;

  // If we're in a branch, add the branch moves
  if (path.length > 1) {
    const branchIndex = getAbsoluteIndexWithinBranches(
      tree[mainIndex].branches,
      path.slice(1),
      absoluteIndex,
    );

    return branchIndex;
  }

  return absoluteIndex;
};

/**
 * Finds all branches at a specific path (alternative move sequences from that position)
 */
export const getBranchesAtPath = (
  tree: MoveNode[],
  path: MovePath,
  rootBranches: MoveNode[][] = [],
): MoveNode[][] => {
  if (path.length === 0) {
    return rootBranches;
  }

  if (isRootBranchPath(path) && path.length === 1) {
    return rootBranches;
  }

  if (!isRootBranchPath(path) && path.length === 1) {
    const node = tree[path[0]];
    return node ? node.branches : [];
  }

  const node = getNodeAtPath(tree, path, rootBranches);
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
  return path.length === 1 && path[0] >= 0;
};
