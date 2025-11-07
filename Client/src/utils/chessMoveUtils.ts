import type { Chess } from "chess.js";
import type { Move as ChessJsMove } from "chess.js";

import type { ChessMove, MoveData } from "../types/chess";

export const toMoveData = (move: MoveData | ChessMove): MoveData => ({
  from: move.from,
  to: move.to,
  promotion: move.promotion,
});

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
