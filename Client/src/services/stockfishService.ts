import axios from "axios";
const PORT = import.meta.env.VITE_API_BASE_URL;

export interface AnalysisLines {
  depth: number;
  multipv: number;
  evaluation: number;
  possibleMate: string | null;
  pv: string;
}
export interface AnalysisResult {
  evaluation: number;
  depth: number;
  bestLine: string;
  possibleMate: string | null;
  lines: AnalysisLines[];
}

export async function analyzePosition(
  fen: string,
  depth: number = 15,
  multipv: number = 1,
  analysisMode: "quick" | "deep" = "quick",
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  try {
    const timeout = analysisMode === "deep" ? 15000 : 10000; // Longer timeout for deep mode
    const response = await axios.post(
      `${PORT}/stockfish/analyze`,
      { fen, depth, multipv, analysisMode },
      { signal, timeout },
    );
    const data = response.data;

    return {
      evaluation: data.evaluation,
      depth: data.depth ?? depth,
      bestLine: data.bestLine ?? "",
      possibleMate: data.possibleMate ?? null,
      lines: Array.isArray(data.lines) ? data.lines : [],
    };
  } catch (error) {
    if (axios.isCancel(error)) {
      return Promise.reject(new Error("Analysis canceled"));
    }
    return Promise.reject(error);
  }
}
