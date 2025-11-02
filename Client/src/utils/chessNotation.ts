import { Chess } from "chess.js";

/**
 * Converts UCI moves (e.g., "e2e4 e7e5") to SAN notation with move numbers (e.g., "1. e4 e5")
 */
export function convertUCIToSAN(
  uciMoves: string[],
  startingFen?: string,
): string {
  if (uciMoves.length === 0) return "";

  try {
    const chess = new Chess(startingFen);
    const sanMoves: string[] = [];
    
    // Determine starting move number based on FEN
    let moveNumber = 1;
    if (startingFen) {
      // Extract move number from FEN
      const parts = startingFen.split(" ");
      if (parts.length >= 5) {
        const fullMoveNumber = parseInt(parts[5]) || 1;
        moveNumber = fullMoveNumber;
      }
    }

    for (let i = 0; i < uciMoves.length; i++) {
      const uciMove = uciMoves[i];
      if (!uciMove || typeof uciMove !== "string") continue;
      
      // Clean the move string - remove any whitespace
      const cleanMove = uciMove.trim();
      if (cleanMove.length < 4) continue;

      try {
        const from = cleanMove.substring(0, 2);
        const to = cleanMove.substring(2, 4);
        const promotion = cleanMove.length > 4 ? cleanMove[4].toLowerCase() : undefined;

        // Validate squares are valid
        if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) {
          continue; // Skip invalid square format
        }

        // Check if move is legal before attempting it
        const legalMoves = chess.moves({ verbose: true });
        const isValidMove = legalMoves.some(
          (m) => m.from === from && m.to === to && (!promotion || m.promotion === promotion)
        );

        if (!isValidMove) {
          // Move is not legal in current position - stop here
          break;
        }

        // Check whose turn it is before making the move
        const isWhiteTurn = chess.turn() === "w";

        const move = chess.move({
          from: from as any,
          to: to as any,
          promotion: promotion as any,
        });

        if (move) {
          if (isWhiteTurn) {
            // White's move - add move number
            sanMoves.push(`${moveNumber}. ${move.san}`);
          } else {
            // Black's move - just the move, move number already added
            sanMoves.push(move.san);
            moveNumber++; // Increment after black's move
          }
        }
      } catch (error) {
        // If a move fails, stop processing the rest of the line
        // This prevents cascading errors from invalid positions
        // Silently break - the moves we've converted so far will be displayed
        break;
      }
    }

    return sanMoves.join(" ");
  } catch (error) {
    // If FEN is invalid or chess instance creation fails, return empty string
    return "";
  }
}

