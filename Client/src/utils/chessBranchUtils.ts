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

export const loadBranchPosition = (
  chess: Chess,
  mainLine: ChessMove[],
  branch: MoveBranch,
  moveIndexInBranch: number,
  allBranches: MoveBranch[] = [],
): boolean => {
  chess.reset();

  // If this branch has a parent branch, we need to load the full path:
  // 1. Main line up to startIndex
  // 2. Parent branch moves (all of them)
  // 3. This branch's moves
  if (branch.parentBranchId) {
    const parentBranch = allBranches.find(
      (b) => b.id === branch.parentBranchId,
    );
    if (parentBranch) {
      // Load main line to the start position
      if (!replayMoves(chess, mainLine, branch.startIndex)) {
        return false;
      }
      // Load all parent branch moves
      if (!replayMoves(chess, parentBranch.moves, parentBranch.moves.length)) {
        return false;
      }
      // Now load this branch's moves from the parent branch's end position
      return replayMoves(chess, branch.moves, moveIndexInBranch + 1);
    }
  }

  // Standard case: branch starts from main line
  if (!replayMoves(chess, mainLine, branch.startIndex)) {
    return false;
  }
  return replayMoves(chess, branch.moves, moveIndexInBranch + 1);
};
