import { Chess } from "chess.js";
import { Puzzle } from "../services/puzzleService/puzzleService";
import { ChessGameState, ChessMove, MoveNode } from "../types/chess";
import { toChessMove } from "./chessMoveUtils";

/**
 * Converts a puzzle to a ChessGameState for study creation
 * @param puzzle - The puzzle to convert
 * @returns ChessGameState with move tree containing the puzzle solution
 */
export function puzzleToGameState(puzzle: Puzzle): ChessGameState {
  const chess = new Chess(puzzle.fen);
  const moveTree: MoveNode[] = [];
  const moves = puzzle.moves || [];

  // Convert UCI moves to ChessMove objects and build move tree
  for (let i = 0; i < moves.length; i++) {
    const uciMove = moves[i];
    if (!uciMove || typeof uciMove !== "string") continue;

    // Parse UCI move (e.g., "e2e4" or "e7e8q")
    const cleanMove = uciMove.trim();
    if (cleanMove.length < 4) continue;

    try {
      const from = cleanMove.substring(0, 2);
      const to = cleanMove.substring(2, 4);
      const promotionChar =
        cleanMove.length > 4 ? cleanMove[4].toLowerCase() : undefined;

      // Validate promotion piece
      const promotion: string | undefined =
        promotionChar && ["q", "r", "b", "n"].includes(promotionChar)
          ? promotionChar
          : undefined;

      // Validate squares are valid
      if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) {
        continue; // Skip invalid square format
      }

      // Make the move
      const moveResult = chess.move({
        from,
        to,
        promotion: promotion as "q" | "r" | "b" | "n" | undefined,
      });

      if (moveResult) {
        const chessMove: ChessMove = toChessMove(moveResult);
        const moveNode: MoveNode = {
          move: chessMove,
          branches: [],
        };
        moveTree.push(moveNode);
      }
    } catch (error) {
      console.error(`Error converting puzzle move ${uciMove}:`, error);
      // Stop if we encounter an invalid move
      break;
    }
  }

  // Determine if board should be flipped based on starting position
  const startingFen = puzzle.fen;
  const fenParts = startingFen.split(" ");
  const activeColor = fenParts[1] || "w";
  const isFlipped = activeColor === "w"; // Flip if white to move (puzzle starts with player's turn)

  // Current path points to the end of the solution
  const currentPath: number[] =
    moveTree.length > 0 ? [moveTree.length - 1] : [];

  return {
    position: startingFen,
    startingPosition: startingFen,
    moveTree,
    rootBranches: [],
    currentPath,
    isFlipped,
  };
}
