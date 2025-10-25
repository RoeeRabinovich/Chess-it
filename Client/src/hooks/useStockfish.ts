import { useState, useEffect, useRef, useCallback } from "react";
import { EngineLine, StockfishConfig, EngineAnalysis } from "../types/chess";

export const useStockfish = (config: StockfishConfig) => {
  const [analysis, setAnalysis] = useState<EngineAnalysis>({
    lines: [],
    isAnalyzing: false,
  });

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const initializeWorker = useCallback(() => {
    if (workerRef.current) return;

    try {
      // Create Stockfish worker
      workerRef.current = new Worker("/stockfish.js");

      workerRef.current.onmessage = (event) => {
        const { data } = event;

        if (data.startsWith("bestmove")) {
          setAnalysis((prev) => ({ ...prev, isAnalyzing: false }));
          return;
        }

        if (data.startsWith("info")) {
          const lines = parseStockfishOutput(data, config.multiPv);
          if (lines.length > 0) {
            setAnalysis((prev) => ({
              ...prev,
              lines,
              isAnalyzing: true,
            }));
          }
        }
      };

      workerRef.current.onerror = (error) => {
        console.error("Stockfish worker error:", error);
        setAnalysis((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: "Engine error occurred",
        }));
      };

      // Initialize engine
      workerRef.current.postMessage("uci");
      workerRef.current.postMessage("isready");
    } catch (error) {
      console.error("Failed to initialize Stockfish:", error);
      setAnalysis((prev) => ({
        ...prev,
        isAnalyzing: false,
        error: "Failed to initialize engine",
      }));
    }
  }, []);

  const parseStockfishOutput = (
    output: string,
    multiPv: number,
  ): EngineLine[] => {
    const lines: EngineLine[] = [];
    const linesData = output.split("\n");

    for (const line of linesData) {
      if (line.includes("multipv")) {
        const parts = line.split(" ");
        const multipv = parseInt(parts[parts.indexOf("multipv") + 1]);

        if (multipv <= multiPv) {
          const depth = parseInt(parts[parts.indexOf("depth") + 1]) || 0;
          const score = parts.find((p) => p.startsWith("score"));
          const pv = parts.find((p) => p.startsWith("pv"));

          if (score && pv) {
            const evaluation = parseEvaluation(score);
            const moves = pv.split(" ").slice(1);

            lines.push({
              moves,
              evaluation,
              depth,
              mate:
                evaluation > 1000
                  ? Math.ceil((10000 - evaluation) / 2)
                  : undefined,
            });
          }
        }
      }
    }

    return lines.sort((a, b) => a.evaluation - b.evaluation);
  };

  const parseEvaluation = (scoreStr: string): number => {
    const parts = scoreStr.split(" ");
    const type = parts[1];
    const value = parseInt(parts[2]);

    if (type === "mate") {
      return value > 0 ? 10000 - value : -10000 - value;
    }

    return value / 100; // Convert centipawns to pawns
  };

  const analyzePosition = useCallback(
    (fen: string) => {
      if (!workerRef.current) {
        initializeWorker();
        return;
      }

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout for analysis
      timeoutRef.current = setTimeout(() => {
        setAnalysis((prev) => ({ ...prev, isAnalyzing: false }));
      }, 10000); // 10 second timeout

      // Configure engine
      workerRef.current.postMessage(
        `setoption name MultiPV value ${config.multiPv}`,
      );
      workerRef.current.postMessage(
        `setoption name UCI_LimitStrength value false`,
      );

      // Start analysis
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${config.depth}`);
    },
    [config, initializeWorker],
  );

  const stopAnalysis = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage("stop");
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAnalysis((prev) => ({ ...prev, isAnalyzing: false }));
  }, []);

  useEffect(() => {
    initializeWorker();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [initializeWorker]);

  return {
    analysis,
    analyzePosition,
    stopAnalysis,
  };
};
