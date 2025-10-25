import { EngineLine } from "../../types/chess";

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
      return mate > 0 ? `+M${mate}` : `-M${Math.abs(mate)}`;
    }
    return evaluation > 0 ? `+${evaluation.toFixed(2)}` : evaluation.toFixed(2);
  };

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 0.5) return "text-green-600";
    if (evaluation < -0.5) return "text-red-600";
    return "text-gray-600";
  };

  if (isAnalyzing && lines.length === 0) {
    return (
      <div className="mb-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
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
    <div className="mb-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Engine Analysis
      </h3>
      <div className="space-y-2">
        {lines.slice(0, 3).map((line, index) => (
          <div
            key={index}
            className={`flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700 ${
              index === 0 ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
            onClick={() => onMoveClick?.(line.moves)}
          >
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {index + 1}.
              </span>
              <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">
                {line.moves.slice(0, 4).join(" ")}
                {line.moves.length > 4 && "..."}
              </span>
            </div>
            <div
              className={`font-mono text-sm ${getEvaluationColor(line.evaluation)}`}
            >
              {formatEvaluation(line.evaluation, line.mate)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
