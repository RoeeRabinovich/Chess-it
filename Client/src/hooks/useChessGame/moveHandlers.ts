import type { Chess } from "chess.js";
import type {
  BranchContext,
  ChessGameState,
  ChessMove,
  MoveBranch,
  MoveData,
} from "../../types/chess";
import {
  createBranchId,
  loadBranchPosition,
} from "../../utils/chessBranchUtils";
import { toChessMove, replayMoves } from "../../utils/chessMoveUtils";

/**
 * Loads the chess position when not at the end of the main line
 */
export const loadPositionForMove = (
  chess: Chess,
  gameState: ChessGameState,
): boolean => {
  try {
    chess.load(gameState.position);
    return true;
  } catch {
    chess.reset();
    return replayMoves(chess, gameState.moves, gameState.currentMoveIndex + 1);
  }
};

/**
 * Appends a move to an existing branch
 */
export const appendMoveToBranch = (
  branches: MoveBranch[],
  branchId: string,
  move: ChessMove,
): MoveBranch[] =>
  branches.map((branch) =>
    branch.id === branchId
      ? { ...branch, moves: [...branch.moves, move] }
      : branch,
  );

/**
 * Handles continuing/extending the current branch
 */
export const handleBranchContinuation = (
  chess: Chess,
  moveData: MoveData,
  currentBranchContext: BranchContext,
  _currentBranch: MoveBranch,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
  setCurrentBranchContext: React.Dispatch<
    React.SetStateAction<BranchContext | null>
  >,
): boolean => {
  const result = chess.move(moveData);
  if (!result) {
    return false;
  }

  const newMove = toChessMove(result);
  setGameState((prev) => ({
    ...prev,
    position: chess.fen(),
    branches: appendMoveToBranch(
      prev.branches,
      currentBranchContext.branchId,
      newMove,
    ),
  }));
  setCurrentBranchContext({
    branchId: currentBranchContext.branchId,
    moveIndexInBranch: currentBranchContext.moveIndexInBranch + 1,
  });
  return true;
};

/**
 * Handles navigating to an existing branch
 */
export const handleBranchNavigation = (
  chess: Chess,
  matchingBranch: MoveBranch,
  gameState: ChessGameState,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
  setCurrentBranchContext: React.Dispatch<
    React.SetStateAction<BranchContext | null>
  >,
): boolean => {
  const success = loadBranchPosition(
    chess,
    gameState.moves,
    matchingBranch,
    0,
    gameState.branches,
  );
  if (!success) {
    return false;
  }

  setGameState((prev) => ({
    ...prev,
    position: chess.fen(),
    currentMoveIndex: matchingBranch.startIndex - 1,
  }));
  setCurrentBranchContext({
    branchId: matchingBranch.id,
    moveIndexInBranch: 0,
  });
  return true;
};

/**
 * Handles creating a new branch
 */
export const handleBranchCreation = (
  chess: Chess,
  moveData: MoveData,
  gameState: ChessGameState,
  currentBranchContext: BranchContext | null,
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>,
  setCurrentBranchContext: React.Dispatch<
    React.SetStateAction<BranchContext | null>
  >,
): boolean => {
  const result = chess.move(moveData);
  if (!result) {
    return false;
  }

  const newMove = toChessMove(result);
  const branchId = createBranchId(gameState.currentMoveIndex);
  const parentBranchId = currentBranchContext?.branchId;

  // Calculate startIndex: if in a branch, use the parent branch's startIndex
  let startIndex = gameState.currentMoveIndex + 1;
  if (parentBranchId) {
    const parentBranch = gameState.branches.find(
      (b) => b.id === parentBranchId,
    );
    if (parentBranch) {
      startIndex = parentBranch.startIndex;
    }
  }

  const newBranch: MoveBranch = {
    id: branchId,
    parentMoveIndex: gameState.currentMoveIndex,
    moves: [newMove],
    startIndex,
    parentBranchId,
    parentMoveIndexInBranch: currentBranchContext?.moveIndexInBranch,
  };
  setGameState((prev) => ({
    ...prev,
    position: chess.fen(),
    branches: [...prev.branches, newBranch],
  }));
  setCurrentBranchContext({
    branchId,
    moveIndexInBranch: 0,
  });
  return true;
};
