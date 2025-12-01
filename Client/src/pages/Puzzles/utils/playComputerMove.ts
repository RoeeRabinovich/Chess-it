import { Chess } from "chess.js";
import { Puzzle } from "../../../services/puzzleService";

/**
 * Play the first computer move from a puzzle
 * @param puzzle - The puzzle containing the moves
 * @param chessRef - Reference to the Chess instance
 * @param setPuzzlePosition - Function to update the puzzle position
 * @param setCurrentMoveIndex - Function to update the current move index
 * @param setPuzzleStartTime - Optional function to set puzzle start time
 * @returns true if the move was played successfully, false otherwise
 */
export const playComputerMove = (
  puzzle: Puzzle,
  chessRef: React.MutableRefObject<Chess | null>,
  setPuzzlePosition: (position: string) => void,
  setCurrentMoveIndex: (index: number) => void,
  setPuzzleStartTime?: (time: number) => void,
): boolean => {
  if (!puzzle.moves.length) {
    return false;
  }

  // Initialize chess instance if needed
  if (!chessRef.current) {
    chessRef.current = new Chess(puzzle.fen);
  }

  chessRef.current.load(puzzle.fen);

  const firstComputerMove = puzzle.moves[0];
  const from = firstComputerMove.substring(0, 2);
  const to = firstComputerMove.substring(2, 4);
  const promotion =
    firstComputerMove.length > 4 ? firstComputerMove[4] : undefined;

  try {
    const move = chessRef.current.move({
      from: from,
      to: to,
      promotion: promotion as "q" | "r" | "b" | "n" | undefined,
    });

    if (move) {
      setPuzzlePosition(chessRef.current.fen());
      setCurrentMoveIndex(1);
      if (setPuzzleStartTime) {
        setPuzzleStartTime(Date.now());
      }
      return true;
    }
  } catch (error) {
    console.error("Error playing computer move:", error);
  }

  return false;
};
