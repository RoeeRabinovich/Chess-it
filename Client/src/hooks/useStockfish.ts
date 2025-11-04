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
  engineLines: Array<{
    moves: string[];
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  enableEngine: () => void;
  disableEngine: () => void;
  toggleEngine: () => void;
}

const evalCache = new Map<
  string,
  {
    evaluation: number;
    depth: number;
    bestLine: string;
    possibleMate?: string | null;
    lines?: Array<{
      pv: string;
      evaluation: number;
      depth: number;
      possibleMate?: string | null;
    }>;
  }
>();

export const useStockfish = (
  position: string,
  moveCount: number = 0, // Track number of moves to auto-enable after first move
  maxDepth: number = 15,
  debounceTime: number = 400,
  multipv: number = 3, // Number of engine lines to return
  initialEngineEnabled?: boolean, // Allow external control of engine state
): UseStockfishReturn => {
  // Auto-enable after first move, or use initialEngineEnabled if provided
  const [isEngineEnabled, setIsEngineEnabled] = useState(
    initialEngineEnabled !== undefined ? initialEngineEnabled : moveCount > 0
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(0);
  const [bestLine, setBestLine] = useState("");
  const [possibleMate, setPossibleMate] = useState("");
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

  const cacheKey = `${position}|d=${maxDepth}|m=${multipv}`;

  // Sync internal state with external initialEngineEnabled prop when it changes
  useEffect(() => {
    if (initialEngineEnabled !== undefined) {
      setIsEngineEnabled(initialEngineEnabled);
    }
  }, [initialEngineEnabled]);

  // Auto-enable engine when a move is made (only if initialEngineEnabled was not provided)
  useEffect(() => {
    if (initialEngineEnabled === undefined && moveCount > 0 && !isEngineEnabled) {
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
      const whiteToMove = chessGame.turn() === "w";
      const normalizeEval = whiteToMove
        ? cached.evaluation
        : -cached.evaluation;
      
      // Reconstruct engine lines from cache if available
      const processedLines = (cached as any).lines ? (cached as any).lines.map((line: any) => {
        const moves = line.pv ? line.pv.trim().split(/\s+/) : [];
        const lineEval = whiteToMove ? line.evaluation : -line.evaluation;
        return {
          moves,
          evaluation: lineEval,
          depth: line.depth,
          possibleMate: line.possibleMate,
        };
      }).sort((a: any, b: any) => {
        if (a.possibleMate && b.possibleMate) {
          return parseInt(a.possibleMate) - parseInt(b.possibleMate);
        }
        if (a.possibleMate) return -1;
        if (b.possibleMate) return 1;
        return b.evaluation - a.evaluation;
      }) : [];
      
      setPositionEvaluation(normalizeEval);
      setDepth(cached.depth);
      setBestLine(cached.bestLine);
      setPossibleMate(cached.possibleMate ?? "");
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
        setEngineLines([]);

        // Call the server API for analysis (request 3 lines)
        const result = await analyzePosition(
          fen,
          maxDepth,
          multipv,
          abortController.signal,
        );
        const whiteToMove = chessGame.turn() === "w";
        const normalizeEval = whiteToMove
          ? result.evaluation
          : -result.evaluation;
        
        // Process engine lines: convert UCI moves to arrays and normalize evals
        const processedLines = result.lines.map((line) => {
          const moves = line.pv ? line.pv.trim().split(/\s+/) : [];
          const lineEval = whiteToMove
            ? line.evaluation
            : -line.evaluation;
          return {
            moves,
            evaluation: lineEval,
            depth: line.depth,
            possibleMate: line.possibleMate,
          };
        }).sort((a, b) => {
          // Sort by evaluation (best first)
          if (a.possibleMate && b.possibleMate) {
            return parseInt(a.possibleMate) - parseInt(b.possibleMate);
          }
          if (a.possibleMate) return -1;
          if (b.possibleMate) return 1;
          return b.evaluation - a.evaluation;
        });

        // cache and update UI
        evalCache.set(cacheKey, { ...result, evaluation: normalizeEval });

        setPositionEvaluation(normalizeEval);
        setDepth(result.depth);
        setBestLine(result.bestLine);
        setPossibleMate(result.possibleMate ?? "");
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
  }, [cacheKey, isEngineEnabled, chessGame, maxDepth, multipv, debounceTime]);

  return {
    isEngineEnabled,
    isAnalyzing,
    positionEvaluation,
    depth,
    bestLine,
    possibleMate,
    engineLines,
    enableEngine: handleEnableEngine,
    disableEngine: handleDisableEngine,
    toggleEngine: handleToggleEngine,
  };
};
