import type { MoveBranch, MoveNode, ChessMove } from "../types/chess";
import { getMainLineMoves } from "./moveTreeUtils";

/**
 * Converts old MoveBranch[] structure to new MoveNode[] tree structure
 */
export const migrateBranchesToTree = (
  mainLine: ChessMove[],
  branches: MoveBranch[],
): MoveNode[] => {
  // Start with main line as MoveNode[]
  const tree: MoveNode[] = mainLine.map((move) => ({
    move,
    branches: [],
  }));

  // Process branches in order of startIndex
  const sortedBranches = [...branches].sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    // Branches with parentBranchId come after those without
    if (a.parentBranchId && !b.parentBranchId) return 1;
    if (!a.parentBranchId && b.parentBranchId) return -1;
    return 0;
  });

  // Map to track branch positions in tree
  const branchPathMap = new Map<string, { mainIndex: number; branchIndex: number }>();

  // First pass: add direct branches from main line
  for (const branch of sortedBranches) {
    if (branch.moves.length === 0) continue;
    if (branch.parentBranchId) continue; // Skip nested branches for now

    if (branch.startIndex < tree.length) {
      const branchNodes: MoveNode[] = branch.moves.map((move) => ({
        move,
        branches: [],
      }));
      const branchIndex = tree[branch.startIndex].branches.length;
      tree[branch.startIndex].branches.push(branchNodes);
      branchPathMap.set(branch.id, { mainIndex: branch.startIndex, branchIndex });
    }
  }

  // Second pass: add nested branches
  for (const branch of sortedBranches) {
    if (branch.moves.length === 0) continue;
    if (!branch.parentBranchId) continue; // Already processed

    const parentPath = branchPathMap.get(branch.parentBranchId);
    if (!parentPath) {
      console.warn(`Parent branch ${branch.parentBranchId} not found for branch ${branch.id}`);
      continue;
    }

    // Find the node in the parent branch where this branch should attach
    const parentMainNode = tree[parentPath.mainIndex];
    const parentBranchSequence = parentMainNode.branches[parentPath.branchIndex];
    
    if (!parentBranchSequence) continue;

    // Attach to the move specified by parentMoveIndexInBranch
    const attachIndex = branch.parentMoveIndexInBranch ?? 0;
    if (attachIndex < parentBranchSequence.length) {
      const branchNodes: MoveNode[] = branch.moves.map((move) => ({
        move,
        branches: [],
      }));
      const branchIndex = parentBranchSequence[attachIndex].branches.length;
      parentBranchSequence[attachIndex].branches.push(branchNodes);
      branchPathMap.set(branch.id, {
        mainIndex: parentPath.mainIndex,
        branchIndex: branchIndex,
      });
    }
  }

  return tree;
};

/**
 * Converts new MoveNode[] tree to old MoveBranch[] structure (for backward compatibility)
 */
export const migrateTreeToBranches = (
  tree: MoveNode[],
): { mainLine: ChessMove[]; branches: MoveBranch[] } => {
  const mainLine: ChessMove[] = getMainLineMoves(tree);
  const branches: MoveBranch[] = [];
  let branchIdCounter = 0;

  const processBranches = (
    node: MoveNode,
    mainIndex: number,
    parentBranchId?: string,
    parentMoveIndexInBranch?: number,
  ) => {
    for (let branchIndex = 0; branchIndex < node.branches.length; branchIndex++) {
      const branchSequence = node.branches[branchIndex];
      if (branchSequence.length === 0) continue;

      const branchId = `branch-${mainIndex}-${branchIdCounter++}`;
      const branchMoves = branchSequence.map((n) => n.move);

      branches.push({
        id: branchId,
        parentMoveIndex: mainIndex,
        moves: branchMoves,
        startIndex: mainIndex,
        parentBranchId,
        parentMoveIndexInBranch,
      });

      // Process nested branches recursively
      for (let moveIndex = 0; moveIndex < branchSequence.length; moveIndex++) {
        const branchNode = branchSequence[moveIndex];
        if (branchNode.branches.length > 0) {
          processBranches(branchNode, mainIndex, branchId, moveIndex);
        }
      }
    }
  };

  // Process branches from each main line node
  for (let i = 0; i < tree.length; i++) {
    processBranches(tree[i], i);
  }

  return { mainLine, branches };
};

