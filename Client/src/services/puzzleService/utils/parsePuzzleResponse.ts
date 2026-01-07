import { Puzzle, PuzzleApiResponse } from "../puzzleService";

/**
 * Parses the API response and extracts puzzles array
 */
export const parsePuzzleResponse = (
  responseData: PuzzleApiResponse | Puzzle[],
): Puzzle[] => {
  if (
    responseData &&
    typeof responseData === "object" &&
    "puzzles" in responseData &&
    Array.isArray((responseData as PuzzleApiResponse).puzzles)
  ) {
    const apiResponse = responseData as PuzzleApiResponse;
    return apiResponse.puzzles || [];
  } else if (Array.isArray(responseData)) {
    return responseData;
  }

  return [];
};
