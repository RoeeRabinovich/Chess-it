import type { BranchContext } from "../types/chess";

export const buildMainCommentKey = (moveIndex: number): string => `main-${moveIndex}`;

export const buildBranchCommentKey = (
  branchId: string,
  moveIndexInBranch: number,
): string => `branch-${branchId}-${moveIndexInBranch}`;

export const resolveCommentKey = (
  moveIndex: number,
  branchContext: BranchContext | null,
): string =>
  branchContext
    ? buildBranchCommentKey(branchContext.branchId, branchContext.moveIndexInBranch)
    : buildMainCommentKey(moveIndex);
