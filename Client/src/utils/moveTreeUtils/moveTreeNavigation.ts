import type { Chess } from "chess.js";
import type { ChessMove, MoveNode, MovePath } from "../../types/chess";
import { replayMoves } from "../chessMoveUtils";
import { isRootBranchPath } from "./moveTreePathUtils";

export const traverseBranchSegments = (
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
