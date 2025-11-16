import { useState, useRef, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { analyzePosition, AnalysisLines } from "../services/stockfishService";
import {
  UseStockfishReturn,
  CachedAnalysis,
  ProcessedEngineLine,
} from "../types/chess";

const evalCache = new Map<string, CachedAnalysis>();

export const useStockfish = (
  position: string,
  moveCount: number = 0, // Track number of moves to auto-enable after first move
  maxDepth: number = 15,
  debounceTime: number = 400,
  multipv: number = 3, // Number of engine lines to return
  initialEngineEnabled?: boolean, // Allow external control of engine state
  analysisMode: "quick" | "deep" = "quick", // Analysis mode: quick (depth-based) or deep (time-based)
): UseStockfishReturn => {
  // Auto-enable after first move, or use initialEngineEnabled if provided
  const [isEngineEnabled, setIsEngineEnabled] = useState(
    initialEngineEnabled !== undefined ? initialEngineEnabled : moveCount > 0,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(0);
  const [bestLine, setBestLine] = useState("");
  const [possibleMate, setPossibleMate] = useState("");
  const [evaluationPosition, setEvaluationPosition] = useState<string>(""); // Track which position the evaluation belongs to
  const [engineLines, setEngineLines] = useState<
    Array<{
      moves: string[];
      evaluation: number;
      depth: number;
      possibleMate?: string | null;
    }>
  >([]);

  const analysisAbortController = useRef<AbortController | null>(null);
  // Create a chess game ref for engine analysis
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  const cacheKey = `${position}|d=${maxDepth}|m=${multipv}|mode=${analysisMode}`;

  // Sync internal state with external initialEngineEnabled prop when it changes
  useEffect(() => {
    if (initialEngineEnabled !== undefined) {
      setIsEngineEnabled(initialEngineEnabled);
    }
  }, [initialEngineEnabled]);

  // Auto-enable engine when a move is made (only if initialEngineEnabled was not provided)
  useEffect(() => {
    if (
      initialEngineEnabled === undefined &&
      moveCount > 0 &&
      !isEngineEnabled
    ) {
      setIsEngineEnabled(true);
    }
  }, [moveCount, isEngineEnabled, initialEngineEnabled]);

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

  // Handle disabling the engine
  const handleDisableEngine = useCallback(() => {
    if (isEngineEnabled) setIsEngineEnabled(false);
  }, [isEngineEnabled]);

  // Handle toggling the engine
  const handleToggleEngine = useCallback(() => {
    setIsEngineEnabled((prev) => !prev);
  }, []);

  // Analyze position when it changes (only if engine is enabled)
  useEffect(() => {
    if (!isEngineEnabled) return;
    if (chessGame.isGameOver() || chessGame.isDraw()) return;

    const fen = chessGame.fen();

    // Abort previous analysis if still running
    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
    }

    // Clean up the cache if it exceeds the maximum number of entries
    const MAX_CACHE_ENTRIES = 200;
    if (evalCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = evalCache.keys().next().value;
      if (oldestKey) {
        evalCache.delete(oldestKey);
      }
    }
    // Check if the position is in the cache and update UI
    if (evalCache.has(cacheKey)) {
      const cached = evalCache.get(cacheKey)!;
      // Ensure chessGame has the correct position before checking turn
      try {
        if (chessGame.fen() !== fen) {
          chessGame.load(fen);
        }
      } catch (error) {
        console.error("Error loading position for cache retrieval:", error);
      }
      // Use raw evaluation from Stockfish (no normalization)
      const normalizeEval = cached.evaluation;

      // Reconstruct engine lines from cache if available
      const processedLines: ProcessedEngineLine[] = cached.lines
        ? cached.lines
            .map((line: AnalysisLines, index: number) => {
              const moves = line.pv ? line.pv.trim().split(/\s+/) : [];
              // Use raw evaluation from Stockfish (always from White's perspective)
              // Preserve MultiPV order
              return {
                moves,
                evaluation: line.evaluation ?? 0,
                depth: line.depth,
                possibleMate: line.possibleMate,
                multipvOrder: line.multipv || index + 1, // Preserve MultiPV order
              };
            })
            .sort((a: ProcessedEngineLine, b: ProcessedEngineLine) => {
              // Preserve Stockfish's MultiPV order (1, 2, 3...)
              // Stockfish already provides lines in best-to-worst order
              return (a.multipvOrder || 999) - (b.multipvOrder || 999);
            })
        : [];

      setPositionEvaluation(normalizeEval);
      setDepth(cached.depth);
      setBestLine(cached.bestLine);
      setPossibleMate(cached.possibleMate ?? "");
      setEvaluationPosition(fen); // Track which position this evaluation belongs to
      setEngineLines(processedLines);
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
        setEvaluationPosition(""); // Clear position tracking when starting new analysis
        setEngineLines([]);

        // Call the server API for analysis (request 3 lines)
        const result = await analyzePosition(
          fen,
          maxDepth,
          multipv,
          analysisMode,
          abortController.signal,
        );
        // Ensure chessGame has the correct position before checking turn
        try {
          if (chessGame.fen() !== fen) {
            chessGame.load(fen);
          }
        } catch (error) {
          console.error("Error loading position for analysis:", error);
        }
        // Use raw evaluation from Stockfish - this is the current position evaluation
        const normalizeEval = result.evaluation;

        // Process engine lines: convert UCI moves to arrays, use raw evaluations
        // IMPORTANT: Stockfish already returns MultiPV lines in the correct order (best to worst)
        // We should preserve this order, not re-sort. The evaluations are:
        // - MultiPV 1: Position evaluation (before any move)
        // - MultiPV 2+: Position evaluation AFTER their first move (from White's perspective)
        const processedLines = result.lines
          .map((line, index) => {
            const moves = line.pv ? line.pv.trim().split(/\s+/) : [];
            // Use raw evaluation from Stockfish (always from White's perspective)
            // Preserve the original MultiPV order (index) to maintain Stockfish's ranking
            return {
              moves,
              evaluation: line.evaluation ?? 0,
              depth: line.depth,
              possibleMate: line.possibleMate,
              multipvOrder: line.multipv || index + 1, // Preserve MultiPV order
            };
          })
          // DO NOT re-sort - Stockfish already provides lines in best-to-worst order
          // The evaluations are correct as-is from Stockfish's perspective
          .sort((a, b) => {
            // Only sort to preserve MultiPV order (1, 2, 3...)
            // This ensures we show lines in Stockfish's intended order
            return (a.multipvOrder || 999) - (b.multipvOrder || 999);
          });

        // cache and update UI
        // Store RAW evaluation in cache (from White's perspective), normalize on retrieval
        evalCache.set(cacheKey, { ...result, evaluation: result.evaluation });

        setPositionEvaluation(normalizeEval);
        setDepth(result.depth);
        setBestLine(result.bestLine);
        setPossibleMate(result.possibleMate ?? "");
        setEvaluationPosition(fen); // Track which position this evaluation belongs to
        setEngineLines(processedLines);
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
      if (analysisAbortController.current === abortController) {
        analysisAbortController.current = null;
      }
    };
  }, [
    cacheKey,
    isEngineEnabled,
    chessGame,
    maxDepth,
    multipv,
    debounceTime,
    analysisMode,
  ]);

  return {
    isEngineEnabled,
    isAnalyzing,
    positionEvaluation,
    depth,
    bestLine,
    possibleMate,
    evaluationPosition,
    engineLines,
    enableEngine: handleEnableEngine,
    disableEngine: handleDisableEngine,
    toggleEngine: handleToggleEngine,
  };
};
