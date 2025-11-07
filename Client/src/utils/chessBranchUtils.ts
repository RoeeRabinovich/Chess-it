import type { Chess } from "chess.js";

import type { ChessMove, MoveBranch } from "../types/chess";
import { replayMoves } from "./chessMoveUtils";

export const findBranchAtStartIndex = (
  branches: MoveBranch[],
  startIndex: number,
): MoveBranch | undefined => branches.find((branch) => branch.startIndex === startIndex);

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
