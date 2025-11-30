/**
 * Merges wrong move square styles with option squares
 */
export const mergeSquareStyles = (
  optionSquares: Record<string, React.CSSProperties>,
  wrongMoveSquare?: string | null,
): Record<string, React.CSSProperties> => {
  const styles = { ...optionSquares };
  if (wrongMoveSquare) {
    styles[wrongMoveSquare] = {
      ...styles[wrongMoveSquare],
      backgroundColor: "rgba(239, 68, 68, 0.4)", // Red background
    };
  }
  return styles;
};

/**
 * Calculates the position for the wrong move X icon overlay
 * Returns an object with left and top percentages
 */
export const calculateWrongMovePosition = (
  square: string,
): { left: string; top: string } => {
  // Calculate position based on square coordinates
  // Each square is 1/8 of the board
  const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
  const rank = parseInt(square[1]);

  return {
    left: `${file * (100 / 8) + (100 / 8) - 8}%`,
    top: `${(8 - rank) * (100 / 8) + 2}%`,
  };
};

