import { Chess } from "chess.js";
import { MoveData } from "../types/chess";
import { moveDataToUCI } from "./chessMoveUtils";

/**
 * Executes a computer move in a puzzle
 * @param chessInstance - The Chess.js instance
 * @param moveUCI - The move in UCI format (e.g., "e2e4" or "e7e8q")
 * @returns The new FEN position after the move, or null if move failed
 */
export const executeComputerMove = (
  chessInstance: Chess,
  moveUCI: string,
): string | null => {
  try {
    const from = moveUCI.substring(0, 2);
    const to = moveUCI.substring(2, 4);
    const promotion =
      moveUCI.length > 4 ? moveUCI[4] : undefined;

    const move = chessInstance.move({
      from: from,
      to: to,
      promotion: promotion as "q" | "r" | "b" | "n" | undefined,
    });

    if (move) {
      return chessInstance.fen();
    }
    return null;
  } catch (error) {
    console.error("Error executing computer move:", error);
    return null;
  }
};

/**
 * Executes a user move on the chess board
 * @param chessInstance - The Chess.js instance
 * @param move - The move data
 * @returns The new FEN position after the move, or null if move failed
 */
export const executeUserMove = (
  chessInstance: Chess,
  move: MoveData,
): string | null => {
  try {
    const chessMove = chessInstance.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion as "q" | "r" | "b" | "n" | undefined,
    });

    if (chessMove) {
      return chessInstance.fen();
    }
    return null;
  } catch (error) {
    console.error("Error executing user move:", error);
    return null;
  }
};

/**
 * Validates if a user move matches the expected move in a puzzle
 * @param userMove - The move data from the user
 * @param expectedMoveUCI - The expected move in UCI format
 * @returns True if the move matches, false otherwise
 */
export const validateMove = (
  userMove: MoveData,
  expectedMoveUCI: string,
): boolean => {
  const userMoveUCI = moveDataToUCI(userMove);
  return userMoveUCI === expectedMoveUCI;
};

/**
 * Calculates solve time in seconds from start time
 * @param startTime - Timestamp when puzzle started
 * @returns Solve time in seconds
 */
export const calculateSolveTime = (startTime: number | null): number | null => {
  if (!startTime) return null;
  return Math.floor((Date.now() - startTime) / 1000);
};

/**
 * Handles puzzle completion logic
 * @param puzzleStartTime - Timestamp when puzzle started
 * @param onPuzzleSolved - Callback when puzzle is solved
 * @param setPuzzleCompletionTime - Setter for completion time
 * @param setIsPuzzleSolved - Setter for solved state
 * @param triggerConfetti - Function to trigger confetti animation
 */
export const handlePuzzleCompletion = (
  puzzleStartTime: number | null,
  onPuzzleSolved: (solveTimeSeconds: number) => void,
  setPuzzleCompletionTime: (time: number | null) => void,
  setIsPuzzleSolved: (solved: boolean) => void,
  triggerConfetti: () => void,
): void => {
  setIsPuzzleSolved(true);
  const solveTimeSeconds = calculateSolveTime(puzzleStartTime);
  if (solveTimeSeconds !== null) {
    setPuzzleCompletionTime(solveTimeSeconds);
    onPuzzleSolved(solveTimeSeconds);
  }
  triggerConfetti();
};

/**
 * Handles wrong move logic
 * @param chessInstance - The Chess.js instance
 * @param move - The wrong move data
 * @param setPositionBeforeWrongMove - Setter for position before wrong move
 * @param setWrongMoveSquare - Setter for wrong move square
 * @param setPuzzlePosition - Setter for puzzle position
 * @param onWrongMove - Callback when wrong move is made
 * @returns The new FEN position after the move, or null if move failed
 */
export const handleWrongMove = (
  chessInstance: Chess | null,
  move: MoveData,
  setPositionBeforeWrongMove: (position: string | null) => void,
  setWrongMoveSquare: (square: string | null) => void,
  setPuzzlePosition: (position: string) => void,
  onWrongMove: () => void,
): string | null => {
  if (chessInstance) {
    setPositionBeforeWrongMove(chessInstance.fen());
  }
  setWrongMoveSquare(move.to);
  onWrongMove();

  if (chessInstance) {
    const newPosition = executeUserMove(chessInstance, move);
    if (newPosition) {
      setPuzzlePosition(newPosition);
    }
    return newPosition;
  }
  return null;
};
