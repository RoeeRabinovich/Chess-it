/**
 * Extract the turn (white or black) from a FEN string
 * @param fen - The FEN string to parse
 * @returns "white" if it's white's turn, "black" if it's black's turn, or null if invalid
 */
export const getTurnFromFen = (fen: string): "white" | "black" | null => {
  if (!fen) return null;
  const parts = fen.split(" ");
  if (parts.length < 2) return null;
  const turnChar = parts[1];
  return turnChar === "w" ? "white" : turnChar === "b" ? "black" : null;
};
