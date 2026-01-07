import axios, { AxiosError } from "axios";
import { Puzzle } from "../puzzleService";
import { mockPuzzles } from "../../../data/mockPuzzles";

/**
 * Handles puzzle API errors and returns mock puzzles as fallback when appropriate
 */
export const handlePuzzleError = (
  error: unknown,
  url: string,
  requestedCount: number,
): Puzzle[] => {
  if (!axios.isAxiosError(error)) {
    console.error("Unexpected error:", error);
    console.warn("Unexpected error. Using mock puzzles as fallback.");
    return mockPuzzles.slice(0, Math.min(requestedCount, mockPuzzles.length));
  }

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

  // Use mock puzzles for server errors and rate limiting
  if (
    statusCode &&
    (statusCode >= 500 ||
      statusCode === 429 ||
      statusCode === 504 ||
      statusCode === 403)
  ) {
    console.warn("API error detected. Using mock puzzles as fallback.");
    return mockPuzzles.slice(0, Math.min(requestedCount, mockPuzzles.length));
  }

  if (axiosError.response) {
    const errorData = axiosError.response.data;
    console.error("Full error response:", JSON.stringify(errorData, null, 2));

    const errorMessage =
      typeof errorData === "string"
        ? errorData
        : typeof errorData === "object" &&
            errorData !== null &&
            "message" in errorData
          ? (errorData as { message: string }).message
          : `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;

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
      console.warn("Network error detected. Using mock puzzles as fallback.");
      return mockPuzzles.slice(0, Math.min(requestedCount, mockPuzzles.length));
    }
    throw new Error(
      "Failed to fetch puzzles: No response from server. Check your network connection.",
    );
  }

  // Fallback for other errors
  console.warn("Unexpected error. Using mock puzzles as fallback.");
  return mockPuzzles.slice(0, Math.min(requestedCount, mockPuzzles.length));
};
