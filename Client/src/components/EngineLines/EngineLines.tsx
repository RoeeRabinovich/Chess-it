import { useRef, useEffect } from "react";

interface EngineLine {
  moves: string[];
  sanNotation?: string;
  evaluation: number;
  depth: number;
  mate?: number;
}

interface EngineLinesProps {
  lines: EngineLine[];
  isAnalyzing: boolean;
  onMoveClick?: (moves: string[]) => void;
  maxLines?: number;
}

export const EngineLines = ({
  lines,

  onMoveClick,
  maxLines = 3,
}: EngineLinesProps) => {
  // Keep previous lines visible during analysis to prevent layout shifts
  const stableLinesRef = useRef<EngineLine[]>([]);

  useEffect(() => {
    // Only update stable lines when new lines actually arrive (not during analysis)
    if (lines.length > 0) {
      stableLinesRef.current = lines;
    }
  }, [lines]);

  // Use stable lines if current lines are empty during analysis, otherwise use current lines
  const displayLines = lines.length > 0 ? lines : stableLinesRef.current;
  const formatEvaluation = (evaluation: number, mate?: number) => {
    if (mate) {
      return mate > 0 ? `+M${Math.abs(mate)}` : `-M${Math.abs(mate)}`;
    }
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  };

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 0.5) return "text-green-600 dark:text-green-400";
    if (evaluation < -0.5) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="w-full max-w-screen space-y-1">
      <h3 className="text-foreground mb-1 text-[10px] font-semibold sm:text-xs">
        Top Engine Lines
      </h3>
      {displayLines.length === 0 ? (
        // Empty state (shouldn't happen since we only render when moves exist)
        <div className="text-muted-foreground py-2 text-[10px] sm:text-xs">
          No engine lines available
        </div>
      ) : (
        // Render engine lines (using stable lines to prevent layout shifts)
        // Show 1 line on mobile, maxLines on desktop
        displayLines.slice(0, maxLines).map((line, index) => {
          const isMobile = index >= 1; // Hide lines 2 and 3 on mobile
          return (
            <div
              key={index}
              className={`flex w-full max-w-screen cursor-pointer items-center gap-1 rounded border px-1.5 py-1 transition-colors sm:gap-1.5 sm:px-2 sm:py-1.5 ${
                index === 0
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted"
              } ${isMobile ? "hidden sm:flex" : ""}`}
              onClick={() => onMoveClick?.(line.moves)}
            >
              <span className="text-muted-foreground shrink-0 text-[9px] font-medium sm:text-[10px]">
                {index + 1}.
              </span>
              <span className="text-foreground min-w-0 flex-1 truncate font-mono text-[9px] leading-tight sm:text-[10px]">
                {line.sanNotation || line.moves.join(" ")}
              </span>
              <div
                className={`shrink-0 font-mono text-[9px] font-semibold sm:text-[10px] ${getEvaluationColor(line.evaluation)}`}
              >
                {formatEvaluation(line.evaluation, line.mate)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
