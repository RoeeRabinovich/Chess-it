import type { ChessMove, MoveNode, MovePath } from "../../types/chess";
import { ROOT_PATH_INDEX, isRootBranchPath } from "./moveTreePathUtils";
import { getNodeAtPath, traverseBranchSegments } from "./moveTreeNavigation";

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

