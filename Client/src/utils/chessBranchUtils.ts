import type { Chess } from "chess.js";

import type { ChessMove, MoveBranch } from "../types/chess";
import { replayMoves } from "./chessMoveUtils";

export const findBranchAtStartIndex = (
  branches: MoveBranch[],
  startIndex: number,
): MoveBranch | undefined =>
  branches.find((branch) => branch.startIndex === startIndex);

/**
 * Finds a branch that starts at the given index AND has a matching first move
 * Used to check if a move should navigate to an existing branch instead of creating a new one
 */
export const findBranchByFirstMove = (
  branches: MoveBranch[],
  startIndex: number,
  move: { from: string; to: string; promotion?: string },
): MoveBranch | undefined => {
  return branches.find((branch) => {
    if (branch.startIndex !== startIndex || branch.moves.length === 0) {
      return false;
    }
    const firstMove = branch.moves[0];
    return (
      firstMove.from === move.from &&
      firstMove.to === move.to &&
      (firstMove.promotion || "") === (move.promotion || "")
    );
  });
};

export const createBranchId = (currentMoveIndex: number): string =>
  `branch-${currentMoveIndex}-${Date.now()}`;

export const loadPositionFromMoves = (
  chess: Chess,
  moves: ChessMove[],
  targetIndex: number,
): boolean => {
  chess.reset();
  return replayMoves(chess, moves, targetIndex + 1);
};

/**
 * Recursively loads all parent branches to build the full path
 * This loads the entire chain up to and including the given branch
 * @param stopAtMoveIndex If provided, only load parent branch up to this move index (for child branches)
 */
const loadBranchChain = (
  chess: Chess,
  mainLine: ChessMove[],
  branch: MoveBranch,
  allBranches: MoveBranch[],
  stopAtMoveIndex?: number,
): boolean => {
  // If this branch has a parent, recursively load the parent chain first
  if (branch.parentBranchId) {
    const parentBranch = allBranches.find(
      (b) => b.id === branch.parentBranchId,
    );
    if (parentBranch) {
      // Recursively load parent branch chain (this will load main line + all parent moves)
      if (!loadBranchChain(chess, mainLine, parentBranch, allBranches)) {
        return false;
      }
      // After loading parent chain, we're at the end of the parent branch
      // If stopAtMoveIndex is provided, only load up to that point
      const movesToLoad = stopAtMoveIndex !== undefined 
        ? stopAtMoveIndex + 1 
        : branch.moves.length;
      return replayMoves(chess, branch.moves, movesToLoad);
    }
  }

  // Base case: branch starts from main line
  // Load main line to the start position
  if (!replayMoves(chess, mainLine, branch.startIndex)) {
    return false;
  }
  // Load branch moves (up to stopAtMoveIndex if provided)
  const movesToLoad = stopAtMoveIndex !== undefined 
    ? stopAtMoveIndex + 1 
    : branch.moves.length;
  return replayMoves(chess, branch.moves, movesToLoad);
};

export const loadBranchPosition = (
  chess: Chess,
  mainLine: ChessMove[],
  branch: MoveBranch,
  moveIndexInBranch: number,
  allBranches: MoveBranch[] = [],
): boolean => {
  chess.reset();

  // If this branch has a parent branch, we need to load the full path recursively
  if (branch.parentBranchId) {
    const parentBranch = allBranches.find(
      (b) => b.id === branch.parentBranchId,
    );
    if (parentBranch) {
      // Recursively load the entire parent chain, but only load parent branch
      // up to where this child branch was created
      const parentStopIndex = branch.parentMoveIndexInBranch;
      if (!loadBranchChain(chess, mainLine, parentBranch, allBranches, parentStopIndex)) {
        return false;
      }
      // Now we're at the correct position (end of parent up to where child was created)
      // Load this branch's moves up to the target index
      return replayMoves(chess, branch.moves, moveIndexInBranch + 1);
    }
  }

  // Standard case: branch starts from main line
  if (!replayMoves(chess, mainLine, branch.startIndex)) {
    return false;
  }
  return replayMoves(chess, branch.moves, moveIndexInBranch + 1);
};
