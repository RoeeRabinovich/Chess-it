interface EvaluationBarProps {
  evaluation: number;
  possibleMate?: string | null;
  isFlipped?: boolean;
}

export const EvaluationBar = ({
  evaluation,
  possibleMate,
  isFlipped = false,
}: EvaluationBarProps) => {
  // Normalize evaluation: positive is good for white, negative is good for black
  // When board is flipped, we still want to show white advantage on top
  const normalizedEval = isFlipped ? -evaluation : evaluation;

  // Convert evaluation to percentage (clamp between -10 and +10 pawns for visualization)
  const maxEval = 10;
  const clampedEval = Math.max(-maxEval, Math.min(maxEval, normalizedEval));
  const percentage = ((clampedEval + maxEval) / (maxEval * 2)) * 100;

  // Format evaluation text
  const formatEval = () => {
    if (possibleMate) {
      const mateNum = parseInt(possibleMate);
      return mateNum > 0 ? `M${mateNum}` : `M${Math.abs(mateNum)}`;
    }
    return normalizedEval > 0 ? `+${normalizedEval.toFixed(1)}` : normalizedEval.toFixed(1);
  };

  return (
    <div className="relative flex h-32 w-12 flex-col overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-200 dark:border-gray-600 dark:bg-gray-800">
      {/* White advantage (top) */}
      <div
        className="absolute top-0 w-full bg-white transition-all duration-300"
        style={{
          height: `${percentage}%`,
          minHeight: normalizedEval > 0 ? "4px" : "0",
        }}
      />
      {/* Black advantage (bottom) */}
      <div
        className="absolute bottom-0 w-full bg-gray-800 transition-all duration-300"
        style={{
          height: `${100 - percentage}%`,
          minHeight: normalizedEval < 0 ? "4px" : "0",
        }}
      />
      {/* Evaluation text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="z-10 text-xs font-bold text-gray-700 dark:text-gray-300">
          {formatEval()}
        </span>
      </div>
      {/* Center line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-500 opacity-50" />
    </div>
  );
};

