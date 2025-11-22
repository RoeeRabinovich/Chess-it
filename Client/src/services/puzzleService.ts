import axios, { AxiosError } from "axios";

// RapidAPI configuration
const RAPIDAPI_BASE_URL = "https://chess-puzzles.p.rapidapi.com";
const RAPIDAPI_KEY = "fb30da447amsh500815fac37b82ep1649e6jsnf921440ec6d5";
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
export async function getPuzzles(params: GetPuzzlesParams): Promise<Puzzle[]> {
  const {
    rating,
    count = 25,
    themes = ["middlegame", "advantage"],
    themesType = "ALL",
    playerMoves = 4,
  } = params;

  let url = "";

  try {
    // Build query parameters
    const queryParams: string[] = [];

    // Handle themes parameter
    // According to API docs: if more than one theme, MUST include themesType
    // If all themes are selected (too many), don't send themes parameter to get random puzzles
    // Or limit to a reasonable number (max 3 themes recommended by API docs)
    if (themes && themes.length > 0) {
      // If too many themes selected (likely "All"), don't filter by themes
      // API docs say "any rating and up to 3 themes should never fail to return 500 matching puzzles"
      if (themes.length <= 3) {
        const themesParam = encodeURIComponent(JSON.stringify(themes));
        queryParams.push(`themes=${themesParam}`);

        // themesType is REQUIRED when more than 1 theme
        if (themes.length > 1) {
          queryParams.push(`themesType=${themesType}`);
        }
      } else {
        // Too many themes - don't filter by themes (get random puzzles)
        console.log(
          `Too many themes selected (${themes.length}). Fetching random puzzles without theme filter.`,
        );
      }
    }

    // Add other parameters
    queryParams.push(`rating=${rating}`);
    queryParams.push(`playerMoves=${playerMoves}`);
    queryParams.push(`count=${count}`);

    url = `${RAPIDAPI_BASE_URL}/?${queryParams.join("&")}`;

    console.log("Fetching puzzles from RapidAPI:", url);
    console.log("Request params:", {
      rating,
      themesCount: themes?.length || 0,
      themes: themes && themes.length <= 3 ? themes : "none (too many)",
      themesType: themes && themes.length > 1 ? themesType : "not sent",
      playerMoves,
      count,
    });

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
      console.error("\n=== RapidAPI Error ===");
      console.error("Error Details:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        code: axiosError.code,
        url: url,
        responseData: axiosError.response?.data,
      });

      if (axiosError.response?.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment and try again.",
        );
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
        if (axiosError.response.status === 400) {
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
          throw new Error(
            "Network/CORS Error: The API might not allow direct browser requests. " +
              "This could be a CORS (Cross-Origin Resource Sharing) issue. " +
              "You may need to make the request through a backend proxy server.",
          );
        }
        throw new Error(
          "Failed to fetch puzzles: No response from server. Check your network connection.",
        );
      }
    }
    console.error("Unexpected error:", error);
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
