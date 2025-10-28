import axios from "axios";
export interface AnalysisResult {
  evaluation: number;
  depth: number;
  bestLine: string;
  possibleMate: string | null;
  lines: Array<{
    depth: number;
    multipv: number;
    evaluation: number;
    possibleMate: string | null;
    pv: string;
  }>;
}

export async function analyzePosition(
  fen: string,
  depth: number = 15,
  multipv: number = 1,
): Promise<AnalysisResult> {
  const response = await axios.post("http://localhost:8181/stockfish/analyze", {
    fen,
    depth,
    multipv,
  });

  return response.data;
}
