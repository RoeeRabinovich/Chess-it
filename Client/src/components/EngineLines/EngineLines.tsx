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
}

export const EngineLines = ({
  lines,
  isAnalyzing,
  onMoveClick,
}: EngineLinesProps) => {
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

  if (isAnalyzing && lines.length === 0) {
    return (
      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">
            Analyzing position...
          </span>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h3 className="mb-1 text-xs font-semibold text-foreground">
        Top Engine Lines
      </h3>
      {lines.slice(0, 3).map((line, index) => (
        <div
          key={index}
          className={`flex cursor-pointer items-center gap-2 rounded border px-2 py-1 transition-colors ${
            index === 0
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:bg-muted"
          }`}
          onClick={() => onMoveClick?.(line.moves)}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {index + 1}.
          </span>
          <span className="flex-1 truncate font-mono text-xs text-foreground">
            {line.sanNotation || line.moves.join(" ")}
          </span>
          <div
            className={`shrink-0 font-mono text-xs font-semibold ${getEvaluationColor(line.evaluation)}`}
          >
            {formatEvaluation(line.evaluation, line.mate)}
          </div>
        </div>
      ))}
    </div>
  );
};
