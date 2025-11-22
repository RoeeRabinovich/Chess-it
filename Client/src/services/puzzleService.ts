import axios, { AxiosError } from "axios";
import { Chess } from "chess.js";

// Lichess API configuration (free, open API with better CORS support)
const LICHESS_API_BASE_URL = "https://lichess.org/api";

/**
 * Puzzle data structure from Lichess API
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
 * Lichess puzzle response structure
 */
export interface LichessPuzzleResponse {
  game?: {
    id: string;
    perf: {
      key: string;
      name: string;
    };
    rated: boolean;
    players: Array<{
      userId: string;
      name: string;
      color: string;
    }>;
    pgn: string;
    clock: string;
  };
  puzzle: {
    id: string;
    rating: number;
    plays: number;
    initialPly: number;
    solution: string[];
    themes: string[];
  };
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
 * Fetches chess puzzles from Lichess API
 * @param params - Parameters for fetching puzzles
 * @returns Promise resolving to an array of puzzles
 */
export async function getPuzzles(params: GetPuzzlesParams): Promise<Puzzle[]> {
  const { rating, count = 25, themes = [] } = params;

  try {
    const puzzles: Puzzle[] = [];

    // Lichess API returns one puzzle per request
    // We need to fetch multiple puzzles by making multiple requests
    // Using Promise.all to fetch multiple puzzles in parallel (limited to avoid rate limits)
    const fetchPromises: Promise<Puzzle>[] = [];
    const maxConcurrent = Math.min(count, 10); // Limit concurrent requests

    for (let i = 0; i < count; i++) {
      // Add delay between batches to avoid rate limiting
      if (i > 0 && i % maxConcurrent === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }

      fetchPromises.push(fetchLichessPuzzle(rating, themes));
    }

    const results = await Promise.allSettled(fetchPromises);

    // Extract successful puzzles
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        puzzles.push(result.value);
      }
    });

    console.log(`Fetched ${puzzles.length} puzzles from Lichess`);
    return puzzles;
  } catch (error) {
    console.error("Error fetching puzzles:", error);
    throw error;
  }
}

/**
 * Fetches a single puzzle from Lichess API
 * Note: Lichess API doesn't support filtering by rating or themes in the request
 * The API returns random puzzles, and we filter client-side if needed
 */
async function fetchLichessPuzzle(
  rating: number, // Reserved for future filtering
  themes: string[], // Reserved for future filtering
): Promise<Puzzle> {
  // Mark parameters as used (will be used for filtering in future)
  void rating;
  void themes;

  try {
    // Lichess puzzle endpoint - returns a random puzzle
    // Correct endpoint is /api/puzzle/next (not /api/puzzle)
    const url = `${LICHESS_API_BASE_URL}/puzzle/next`;

    console.log("Fetching puzzle from Lichess:", url);

    const response = await axios.get<LichessPuzzleResponse>(url, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.data || !response.data.puzzle) {
      throw new Error("Invalid puzzle response from Lichess");
    }

    const lichessPuzzle = response.data.puzzle;
    const game = response.data.game;

    // Convert Lichess puzzle format to our Puzzle format
    // We need to extract FEN from the game PGN
    const fen = extractFENFromPGN(game?.pgn || "", lichessPuzzle.initialPly);

    const puzzle: Puzzle = {
      id: lichessPuzzle.id,
      rating: lichessPuzzle.rating,
      themes: lichessPuzzle.themes,
      fen: fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Fallback to starting position
      moves: lichessPuzzle.solution,
      playerMoves: lichessPuzzle.solution.length,
      solution: lichessPuzzle.solution,
      gameId: game?.id,
    };

    return puzzle;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Lichess API Error:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      throw new Error(
        `Failed to fetch puzzle from Lichess: ${axiosError.message}`,
      );
    }
    throw error;
  }
}

/**
 * Extracts FEN position from PGN at a specific move number
 */
function extractFENFromPGN(pgn: string, initialPly: number): string | null {
  if (!pgn) return null;

  try {
    const chess = new Chess();
    chess.loadPgn(pgn);

    // Navigate to the initial ply position
    const history = chess.history({ verbose: true });
    const targetMoveIndex = Math.floor(initialPly / 2);

    // Reset and replay moves up to initialPly
    chess.reset();
    for (let i = 0; i < targetMoveIndex && i < history.length; i++) {
      chess.move(history[i]);
    }

    return chess.fen();
  } catch (error) {
    console.error("Error extracting FEN from PGN:", error);
    return null;
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
