import axios, { AxiosError } from "axios";

// RapidAPI configuration
const RAPIDAPI_BASE_URL = "https://chess-puzzles.p.rapidapi.com";
const RAPIDAPI_KEY = "fb30da447amsh500815fac37b82ep1649e6jsnf921440ec6d5";
const RAPIDAPI_HOST = "chess-puzzles.p.rapidapi.com";

/**
 * Puzzle data structure from the API
 */
export interface Puzzle {
  /** Puzzle ID */
  id?: string;
  /** Puzzle rating */
  rating: number;
  /** Puzzle themes */
  themes: string[];
  /** FEN position of the puzzle */
  fen: string;
  /** Solution moves in UCI format */
  moves: string[];
  /** Number of player moves required */
  playerMoves?: number;
}

/**
 * Response structure from the chess puzzles API
 */
export interface PuzzleApiResponse {
  puzzles?: Puzzle[];
  count?: number;
}

/**
 * Parameters for fetching puzzles
 */
export interface GetPuzzlesParams {
  /** User's puzzle rating (used to fetch appropriate difficulty) */
  rating: number;
  /** Number of puzzles to fetch (default: 25) */
  count?: number;
  /** Puzzle themes (default: ["middlegame", "advantage"]) */
  themes?: string[];
  /** Themes type (default: "ALL") */
  themesType?: "ALL" | "ANY";
  /** Number of player moves (default: 4) */
  playerMoves?: number;
}

/**
 * Fetches chess puzzles from RapidAPI
 * @param params - Parameters for fetching puzzles
 * @returns Promise resolving to an array of puzzles
 */
export async function getPuzzles(
  params: GetPuzzlesParams,
): Promise<Puzzle[]> {
  try {
    const {
      rating,
      count = 25,
      themes = ["middlegame", "advantage"],
      themesType = "ALL",
      playerMoves = 4,
    } = params;

    // Encode themes array for URL
    const themesParam = encodeURIComponent(JSON.stringify(themes));

    // Build query string
    const queryParams = new URLSearchParams({
      themes: themesParam,
      rating: rating.toString(),
      themesType,
      playerMoves: playerMoves.toString(),
      count: count.toString(),
    });

    const url = `${RAPIDAPI_BASE_URL}/?${queryParams.toString()}`;

    const response = await axios.get<PuzzleApiResponse>(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      timeout: 10000,
    });

    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.puzzles && Array.isArray(response.data.puzzles)) {
      return response.data.puzzles;
    } else {
      // If response structure is different, return empty array
      console.warn("Unexpected API response structure:", response.data);
      return [];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Server responded with error status
        throw new Error(
          `Failed to fetch puzzles: ${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else if (axiosError.request) {
        // Request was made but no response received
        throw new Error("Failed to fetch puzzles: No response from server");
      }
    }
    throw error;
  }
}

/**
 * Fetches a single puzzle based on rating
 * @param rating - User's puzzle rating
 * @returns Promise resolving to a single puzzle
 */
export async function getPuzzle(rating: number): Promise<Puzzle | null> {
  try {
    const puzzles = await getPuzzles({ rating, count: 1 });
    return puzzles.length > 0 ? puzzles[0] : null;
  } catch (error) {
    console.error("Error fetching puzzle:", error);
    throw error;
  }
}

