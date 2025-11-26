import type { Chess } from "chess.js";

import type { ChessMove, MoveBranch } from "../types/chess";
import { replayMoves } from "./chessMoveUtils";

export const findBranchAtStartIndex = (
  branches: MoveBranch[],
  startIndex: number,
): MoveBranch | undefined => branches.find((branch) => branch.startIndex === startIndex);

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
): boolean => {
  chess.reset();
  if (!replayMoves(chess, mainLine, branch.startIndex)) {
    return false;
  }
  return replayMoves(chess, branch.moves, moveIndexInBranch + 1);
};
