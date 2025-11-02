interface EvaluationBarProps {
  evaluation: number;
  possibleMate?: string | null;
  isFlipped?: boolean;
  height?: string | number;
}

export const EvaluationBar = ({
  evaluation,
  possibleMate,
  isFlipped = false,
  height = "100%",
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

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className="relative flex w-12 flex-col overflow-hidden rounded-lg border-2 border-border bg-muted"
      style={{ height: heightStyle }}
    >
      {/* White advantage (top) */}
      <div
        className="absolute top-0 w-full bg-white transition-all duration-300 dark:bg-white"
        style={{
          height: `${percentage}%`,
          minHeight: normalizedEval > 0 ? "4px" : "0",
        }}
      />
      {/* Black advantage (bottom) */}
      <div
        className="absolute bottom-0 w-full bg-gray-800 transition-all duration-300 dark:bg-gray-900"
        style={{
          height: `${100 - percentage}%`,
          minHeight: normalizedEval < 0 ? "4px" : "0",
        }}
      />
      {/* Evaluation text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
          {formatEval()}
        </span>
      </div>
      {/* Center line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border opacity-50" />
    </div>
  );
};

