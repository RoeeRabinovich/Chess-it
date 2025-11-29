import axios, { AxiosError } from "axios";
import { mockPuzzles } from "../data/mockPuzzles";

// RapidAPI configuration
const RAPIDAPI_BASE_URL = "https://chess-puzzles.p.rapidapi.com";
const RAPIDAPI_KEY = "f4a0bf4fb8msh1dc8034ed679677p1d4ed1jsn766d960f3b32a";
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

  const requestedCount = count; // Store count for use in catch block
  let url = "";

  try {
    // Build query parameters
    const queryParams: string[] = [];

    // Separate difficulty themes from regular themes
    // Difficulty themes are filtered out (not sent to API)
    const difficultyThemeMap: Record<string, number> = {
      oneMove: 1,
      short: 2,
      long: 3,
      veryLong: 4,
    };

    const regularThemes =
      themes?.filter((theme) => !(theme in difficultyThemeMap)) || [];

    // Check if difficulty themes are selected
    const difficultyThemes =
      themes?.filter((theme) => theme in difficultyThemeMap) || [];

    // Calculate playerMoves: use difficulty theme if selected, otherwise base on rating
    let actualPlayerMoves = playerMoves;

    if (difficultyThemes.length > 0) {
      // If difficulty theme is selected, use it to override rating-based difficulty
      actualPlayerMoves = difficultyThemeMap[difficultyThemes[0]];
    } else {
      // Rating-based difficulty mapping (default when no difficulty theme selected):
      // 0-800: 2 moves (short puzzles)
      // 800-1200: 3 moves (medium puzzles)
      // 1200-1600: 4 moves (long puzzles)
      // 1600+: 4 moves (very long puzzles)
      if (rating < 800) {
        actualPlayerMoves = 2; // Short puzzles for beginners
      } else if (rating < 1200) {
        actualPlayerMoves = 3; // Medium puzzles for intermediate players
      } else if (rating < 1600) {
        actualPlayerMoves = 4; // Long puzzles for advanced players
      } else {
        actualPlayerMoves = 4; // Very long puzzles for expert players
      }
    }

    // Handle themes parameter (only non-difficulty themes)
    // Also filter out special themes that might not work with the themes parameter
    const specialThemeKeys = [
      "mix",
      "master",
      "masterVsMaster",
      "superGM",
      "playerGames",
    ];
    const themesToSend = regularThemes.filter(
      (theme) => !specialThemeKeys.includes(theme),
    );

    if (themesToSend.length > 0) {
      const themesParam = encodeURIComponent(JSON.stringify(themesToSend));
      queryParams.push(`themes=${themesParam}`);

      // themesType is REQUIRED when more than 1 theme
      if (themesToSend.length > 1) {
        queryParams.push(`themesType=${themesType}`);
      }
    } else if (regularThemes.length > 0) {
      // Only special themes selected - don't send themes parameter
      console.warn(
        "Only special themes selected. These themes may not work with the themes parameter.",
      );
    }

    // Add other parameters
    queryParams.push(`rating=${rating}`);
    queryParams.push(`playerMoves=${actualPlayerMoves}`);
    queryParams.push(`count=${count}`);

    url = `${RAPIDAPI_BASE_URL}/?${queryParams.join("&")}`;

    console.log("=== Request Details ===");
    console.log("Full URL:", url);
    console.log("Themes requested:", themes || []);
    console.log("Regular themes (before filtering):", regularThemes);
    console.log("Themes sent to API:", themesToSend);
    console.log(
      "Special themes filtered out:",
      regularThemes.filter((t) => specialThemeKeys.includes(t)),
    );
    console.log(
      "ThemesType:",
      themesToSend.length > 1 ? themesType : "not sent (only 1 or 0 themes)",
    );
    console.log(
      "PlayerMoves:",
      actualPlayerMoves,
      difficultyThemes.length > 0
        ? `(from difficulty theme: ${difficultyThemes[0]})`
        : `(based on rating: ${rating})`,
    );
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

    // Handle response structure - API returns { "puzzles": [...] }
    let puzzles: Puzzle[] = [];

    if (
      response.data &&
      typeof response.data === "object" &&
      "puzzles" in response.data &&
      Array.isArray((response.data as PuzzleApiResponse).puzzles)
    ) {
      // Standard API response format
      const apiResponse = response.data as PuzzleApiResponse;
      puzzles = apiResponse.puzzles || [];
      console.log(`Received ${puzzles.length} puzzles from puzzles property`);
    } else if (Array.isArray(response.data)) {
      // Fallback: if response is directly an array
      console.log(`Received ${response.data.length} puzzles as array`);
      puzzles = response.data;
    } else {
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
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;

      console.error("\n=== RapidAPI Error ===");
      console.error("Error Details:", {
        status: statusCode,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        code: axiosError.code,
        url: url,
        responseData: axiosError.response?.data,
      });

      // Use mock puzzles for server errors (500, 502, 503, 504) and rate limiting (429)
      if (
        statusCode &&
        (statusCode >= 500 ||
          statusCode === 429 ||
          statusCode === 504 ||
          statusCode === 403)
      ) {
        console.warn("API error detected. Using mock puzzles as fallback.");
        console.log(`Using ${mockPuzzles.length} mock puzzles`);

        // Return a subset of mock puzzles based on requested count
        const puzzlesToReturn = mockPuzzles.slice(
          0,
          Math.min(requestedCount, mockPuzzles.length),
        );
        return puzzlesToReturn;
      }

      if (axiosError.response) {
        const errorData = axiosError.response.data;

        // Log full error response for debugging
        console.error(
          "Full error response:",
          JSON.stringify(errorData, null, 2),
        );

        const errorMessage =
          typeof errorData === "string"
            ? errorData
            : typeof errorData === "object" &&
                errorData !== null &&
                "message" in errorData
              ? (errorData as { message: string }).message
              : `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;

        // Special handling for 400 errors
        if (statusCode === 400) {
          if (
            errorMessage.includes("No Matching Puzzles") ||
            errorMessage.includes("No matching puzzles")
          ) {
            throw new Error(
              `No puzzles found matching the selected themes. Try selecting different themes or using fewer themes.`,
            );
          }
          throw new Error(
            `Bad Request (400): ${errorMessage}. Please check your theme selection and try again.`,
          );
        }

        throw new Error(`Failed to fetch puzzles: ${errorMessage}`);
      } else if (axiosError.request) {
        console.error("No response received from server:", axiosError.request);
        if (
          axiosError.code === "ERR_NETWORK" ||
          axiosError.message.includes("Network Error")
        ) {
          // Use mock puzzles for network errors too
          console.warn(
            "Network error detected. Using mock puzzles as fallback.",
          );
          return mockPuzzles.slice(
            0,
            Math.min(requestedCount, mockPuzzles.length),
          );
        }
        throw new Error(
          "Failed to fetch puzzles: No response from server. Check your network connection.",
        );
      }
    }
    console.error("Unexpected error:", error);
    // Use mock puzzles as fallback for unexpected errors too
    console.warn("Unexpected error. Using mock puzzles as fallback.");
    return mockPuzzles.slice(0, Math.min(requestedCount, mockPuzzles.length));
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
