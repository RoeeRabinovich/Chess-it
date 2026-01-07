import axios from "axios";
import { buildPuzzleQueryParams } from "./utils/buildPuzzleQueryParams";
import { parsePuzzleResponse } from "./utils/parsePuzzleResponse";
import { handlePuzzleError } from "./utils/handlePuzzleError";

// RapidAPI configuration
const RAPIDAPI_KEY = "f4a0bf4fb8msh1dc8034ed679677p1d4ed1jsn766d960f3b32";
const RAPIDAPI_HOST = "chess-puzzles.p.rapidapi.com";

/**
 * Puzzle data structure from RapidAPI
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
  /** Puzzle solution (first move) */
  solution?: string[];
  /** Puzzle game ID */
  gameId?: string;
}

/**
 * RapidAPI puzzle response structure
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
  /** Themes type - "ALL" means puzzle must have all themes, "OR" means puzzle can have any of the themes */
  themesType?: "ALL" | "OR";
  /** Number of player moves (default: 4) */
  playerMoves?: number;
}

/**
 * Fetches chess puzzles from RapidAPI
 * @param params - Parameters for fetching puzzles
 * @returns Promise resolving to an array of puzzles
 */
export async function getPuzzles(params: GetPuzzlesParams): Promise<Puzzle[]> {
  const {
    rating,
    count = 15,
    themes = ["middlegame", "advantage"],
    themesType = "OR", // Default to "OR" for better results (API expects "ALL" or "OR")
    playerMoves = 4,
  } = params;

  const requestedCount = count;

  // Build query parameters (needed for both request and error handling)
  const { url, actualPlayerMoves, themesToSend } = buildPuzzleQueryParams(
    rating,
    count,
    themes,
    themesType,
    playerMoves,
  );

  try {
    console.log("=== Request Details ===");
    console.log("Full URL:", url);
    console.log("Themes requested:", themes || []);
    console.log("Themes sent to API:", themesToSend);
    console.log("PlayerMoves:", actualPlayerMoves);
    console.log("Rating:", rating);
    console.log("Count:", count);
    console.log("======================");

    const response = await axios.get<PuzzleApiResponse | Puzzle[]>(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Log full response for debugging
    console.log("=== RapidAPI Response ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Full Response Data:", JSON.stringify(response.data, null, 2));
    console.log(
      "Response Data Type:",
      Array.isArray(response.data) ? "array" : typeof response.data,
    );
    console.log("===========================");

    // Parse response
    const puzzles = parsePuzzleResponse(response.data);

    if (puzzles.length === 0) {
      console.warn("Unexpected API response structure:", {
        data: response.data,
        type: typeof response.data,
        keys:
          typeof response.data === "object" && response.data !== null
            ? Object.keys(response.data)
            : null,
      });
      return [];
    }

    console.log(`\n=== Fetch Summary ===`);
    console.log(`Requested: ${count} puzzles`);
    console.log(`Successfully fetched: ${puzzles.length} puzzles`);

    return puzzles;
  } catch (error) {
    return handlePuzzleError(error, url, requestedCount);
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
