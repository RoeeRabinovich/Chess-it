import type { Chess } from "chess.js";
import type { Move as ChessJsMove } from "chess.js";

import type { ChessMove, MoveData } from "../types/chess";

export const toMoveData = (move: MoveData | ChessMove): MoveData => ({
  from: move.from,
  to: move.to,
  promotion: move.promotion,
});

/**
 * Converts MoveData to UCI format string (e.g., "e2e4" or "e7e8q")
 */
export const moveDataToUCI = (move: MoveData): string => {
  const promotion = move.promotion ? move.promotion.toLowerCase() : "";
  return `${move.from}${move.to}${promotion}`;
};

export const toChessMove = (move: ChessJsMove): ChessMove => ({
  from: move.from,
  to: move.to,
  promotion: move.promotion,
  san: move.san,
  lan: move.lan,
  before: move.before,
  after: move.after,
  captured: move.captured,
  flags: move.flags,
  piece: move.piece,
  color: move.color,
});

export const replayMoves = (
  chess: Chess,
  moves: ChessMove[],
  limit: number = moves.length,
): boolean => {
  const slice = moves.slice(0, limit);
  for (const move of slice) {
    const result = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    if (!result) {
      return false;
    }
  }
  return true;
};
