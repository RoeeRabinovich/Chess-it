import { useState, useRef, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { analyzePosition } from "../services/stockfishService";

interface UseStockfishReturn {
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  positionEvaluation: number;
  depth: number;
  bestLine: string;
  possibleMate: string;
  enableEngine: () => void;
}

export const useStockfish = (
  position: string,
  isEnabled?: boolean,
): UseStockfishReturn => {
  const [isEngineEnabled, setIsEngineEnabled] = useState(isEnabled ?? false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisAbortController = useRef<AbortController | null>(null);

  // Create a chess game ref for engine analysis
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // Store engine variables
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(0);
  const [bestLine, setBestLine] = useState("");
  const [possibleMate, setPossibleMate] = useState("");

  useEffect(() => {
    try {
      chessGame.load(position);
    } catch (error) {
      console.error("Failed to load position into engine:", error);
    }
  }, [position, chessGame]);
  // Defer analysis to not block UI and allow debouncing

  // Handle enabling the engine
  const handleEnableEngine = useCallback(() => {
    if (isEngineEnabled) return;
    setIsEngineEnabled(true);
  }, [isEngineEnabled]);

  // Analyze position when it changes (only if engine is enabled)
  useEffect(() => {
    if (!isEngineEnabled) return;
    if (chessGame.isGameOver() || chessGame.isDraw()) return;

    // Abort previous analysis if still running
    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
    }
    // Create new abort controller for the current analysis
    analysisAbortController.current = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        setDepth(0);
        setBestLine("");
        setPositionEvaluation(0);
        setPossibleMate("");

        const fen = chessGame.fen();

        // Call the server API for analysis
        const result = await analyzePosition(fen, 15, 1);

        // Update the UI with results
        setPositionEvaluation(result.evaluation);
        setDepth(result.depth);
        setBestLine(result.bestLine);
        setPossibleMate(result.possibleMate || "");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Analysis failed:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }, 100); // Debounce for 500ms

    // Cleanup function to abort analysis and clear timeout
    return () => {
      clearTimeout(timeoutId);
      if (analysisAbortController.current) {
        analysisAbortController.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, isEngineEnabled, chessGame]);

  return {
    isEngineEnabled,

    isAnalyzing,

    positionEvaluation,

    depth,

    bestLine,
    possibleMate,
    enableEngine: handleEnableEngine,
  };
};
