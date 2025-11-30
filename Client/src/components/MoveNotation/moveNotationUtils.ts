/**
 * Check if a main line move has a comment
 */
export const hasComment = (
  moveIndex: number,
  comments: Map<string, string>,
): boolean => {
  const commentKey = `main-${moveIndex}`;
  return comments.has(commentKey) && comments.get(commentKey)?.trim() !== "";
};

/**
 * Check if a branch move has a comment
 */
export const hasBranchComment = (
  branchId: string,
  moveIndexInBranch: number,
  comments: Map<string, string>,
): boolean => {
  const commentKey = `branch-${branchId}-${moveIndexInBranch}`;
  return comments.has(commentKey) && comments.get(commentKey)?.trim() !== "";
};

