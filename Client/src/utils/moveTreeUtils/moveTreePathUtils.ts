import type { ChessMove, MoveNode, MovePath } from "../../types/chess";

export const ROOT_PATH_INDEX = -1;

export const isRootBranchPath = (path: MovePath): boolean =>
  path.length > 0 && path[0] === ROOT_PATH_INDEX;

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

  // Inline node retrieval logic to avoid circular dependency
  let currentNode: MoveNode | null = null;

  if (isRootBranchPath(path)) {
    let branches = rootBranches;
    for (let i = 1; i < path.length; i += 2) {
      const branchIndex = path[i];
      const moveIndexInBranch = path[i + 1];

      if (branchIndex === undefined || moveIndexInBranch === undefined) {
        break;
      }

      if (branchIndex < 0 || branchIndex >= branches.length) {
        return [];
      }

      const branchSequence = branches[branchIndex];
      if (moveIndexInBranch < 0 || moveIndexInBranch >= branchSequence.length) {
        return [];
      }

      currentNode = branchSequence[moveIndexInBranch];
      branches = currentNode.branches;
    }
  } else {
    const mainIndex = path[0];
    if (mainIndex < 0 || mainIndex >= tree.length) {
      return [];
    }

    currentNode = tree[mainIndex];

    if (path.length > 1) {
      let branches = currentNode.branches;
      for (let i = 1; i < path.length; i += 2) {
        const branchIndex = path[i];
        const moveIndexInBranch = path[i + 1];

        if (branchIndex === undefined || moveIndexInBranch === undefined) {
          break;
        }

        if (branchIndex < 0 || branchIndex >= branches.length) {
          return [];
        }

        const branchSequence = branches[branchIndex];
        if (moveIndexInBranch < 0 || moveIndexInBranch >= branchSequence.length) {
          return [];
        }

        currentNode = branchSequence[moveIndexInBranch];
        branches = currentNode.branches;
      }
    }
  }

  return currentNode ? currentNode.branches : [];
};

