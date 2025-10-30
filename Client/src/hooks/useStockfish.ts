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

const evalCache = new Map<
  string,
  {
    evaluation: number;
    depth: number;
    bestLine: string;
    possibleMate?: string | null;
  }
>();

export const useStockfish = (
  position: string,
  isEnabled?: boolean,
  maxDepth: number = 15,
  debounceTime: number = 400,
): UseStockfishReturn => {
  const [isEngineEnabled, setIsEngineEnabled] = useState(isEnabled ?? false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(0);
  const [bestLine, setBestLine] = useState("");
  const [possibleMate, setPossibleMate] = useState("");

  const analysisAbortController = useRef<AbortController | null>(null);
  // Create a chess game ref for engine analysis
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  useEffect(() => {
    try {
      if (chessGame.fen() !== position) {
        chessGame.load(position);
      }
    } catch (error) {
      console.error("Invalid FEN position:", error);
    }
  }, [position, chessGame]);

  // Handle enabling the engine
  const handleEnableEngine = useCallback(() => {
    if (!isEngineEnabled) setIsEngineEnabled(true);
  }, [isEngineEnabled]);

  // Analyze position when it changes (only if engine is enabled)
  useEffect(() => {
    if (!isEngineEnabled) return;
    if (chessGame.isGameOver() || chessGame.isDraw()) return;

    const fen = chessGame.fen();

    // Abort previous analysis if still running
    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
    }

    if (evalCache.has(fen)) {
      const cached = evalCache.get(fen)!;
      setPositionEvaluation(cached.evaluation);
      setDepth(cached.depth);
      setBestLine(cached.bestLine);
      setPossibleMate(cached.possibleMate ?? "");
      return;
    }

    // Create new abort controller for the current analysis
    const abortController = new AbortController();
    analysisAbortController.current = abortController;

    const timeoutId = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        setDepth(0);
        setBestLine("");
        setPositionEvaluation(0);
        setPossibleMate("");

        // Call the server API for analysis
        const result = await analyzePosition(
          fen,
          maxDepth,
          1,
          abortController.signal,
        );

        // cache and update UI
        evalCache.set(fen, result);
        setPositionEvaluation(result.evaluation);
        setDepth(result.depth);
        setBestLine(result.bestLine);
        setPossibleMate(result.possibleMate ?? "");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Analysis failed:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }, debounceTime);

    // Cleanup function to abort analysis and clear timeout
    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, isEngineEnabled, chessGame, maxDepth, debounceTime]);

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
