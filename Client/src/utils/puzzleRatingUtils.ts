/**
 * Calculates rating change for puzzle solving
 * @param userRating - Current user's puzzle rating
 * @param puzzleRating - Rating of the puzzle
 * @param hasWrongMove - Whether user made a wrong move
 * @param solveTimeSeconds - Time taken to solve puzzle in seconds
 * @returns Rating change (positive for gain, negative for loss)
 */
export function calculateRatingChange(
  userRating: number,
  puzzleRating: number,
  hasWrongMove: boolean,
  solveTimeSeconds: number,
): number {
  // Safety cap: max ±25 points per puzzle
  const MAX_CHANGE = 25;
  const MIN_CHANGE = -25;

  let change = 0;

  if (hasWrongMove) {
    // Wrong move penalty (only applied once per puzzle)
    if (puzzleRating > userRating) {
      change = -8; // Harder puzzle
    } else if (puzzleRating < userRating) {
      change = -15; // Easier puzzle
    } else {
      change = -12; // Equal rating (average of -8 and -15)
    }
  } else {
    // Correct solve reward
    if (puzzleRating > userRating) {
      change = 14; // Harder puzzle
    } else if (puzzleRating < userRating) {
      change = 5; // Easier puzzle
    } else {
      change = 10; // Equal rating (average of 14 and 5)
    }

    // Bonus for solving within 30 seconds
    if (solveTimeSeconds <= 30) {
      change += 3;
    }
  }

  // Apply safety cap
  if (change > MAX_CHANGE) {
    change = MAX_CHANGE;
  } else if (change < MIN_CHANGE) {
    change = MIN_CHANGE;
  }

  return change;
}

