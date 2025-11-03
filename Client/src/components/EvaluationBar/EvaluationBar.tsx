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
  const normalizedEval = isFlipped ? -evaluation : evaluation;

  // Handle mate: show 100% of winning side's color
  let whitePercentage: number;
  let blackPercentage: number;

  if (possibleMate) {
    const mateNum = parseInt(possibleMate);
    // Mate for white (positive) = 100% white, Mate for black (negative) = 100% black
    if (mateNum > 0) {
      // White has mate
      whitePercentage = 100;
      blackPercentage = 0;
    } else {
      // Black has mate
      whitePercentage = 0;
      blackPercentage = 100;
    }
  } else {
    // Regular evaluation: convert to percentage (clamp between -10 and +10 pawns for visualization)
    const maxEval = 10;
    const clampedEval = Math.max(-maxEval, Math.min(maxEval, normalizedEval));
    const percentage = ((clampedEval + maxEval) / (maxEval * 2)) * 100;
    whitePercentage = percentage;
    blackPercentage = 100 - percentage;
  }

  // Determine which side fills from where based on isFlipped
  // When isFlipped === false: white at bottom (fills from bottom), black at top (fills from top)
  // When isFlipped === true: black at bottom (fills from bottom), white at top (fills from top)
  // Each color fills from where that player's pieces are positioned
  const whiteFromBottom = !isFlipped; // White fills from bottom when at bottom
  const blackFromBottom = isFlipped; // Black fills from bottom when at bottom

  // Format evaluation text
  const formatEval = () => {
    if (possibleMate) {
      const mateNum = parseInt(possibleMate);
      return mateNum > 0 ? `M${mateNum}` : `M${Math.abs(mateNum)}`;
    }
    return normalizedEval > 0
      ? `+${normalizedEval.toFixed(1)}`
      : normalizedEval.toFixed(1);
  };

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className="border-border bg-muted relative flex w-12 flex-col overflow-hidden rounded-lg border-2"
      style={{ height: heightStyle }}
    >
      {/* White section - fills from bottom when isFlipped === false, from top when isFlipped === true */}
      {whiteFromBottom ? (
        <div
          className="absolute bottom-0 w-full bg-white transition-all duration-300 dark:bg-white"
          style={{
            height: `${whitePercentage}%`,
            minHeight: whitePercentage > 0 ? "4px" : "0",
          }}
        />
      ) : (
        <div
          className="absolute top-0 w-full bg-white transition-all duration-300 dark:bg-white"
          style={{
            height: `${whitePercentage}%`,
            minHeight: whitePercentage > 0 ? "4px" : "0",
          }}
        />
      )}
      {/* Black section - fills from bottom when isFlipped === true, from top when isFlipped === false */}
      {blackFromBottom ? (
        <div
          className="absolute bottom-0 w-full bg-gray-800 transition-all duration-300 dark:bg-gray-900"
          style={{
            height: `${blackPercentage}%`,
            minHeight: blackPercentage > 0 ? "4px" : "0",
          }}
        />
      ) : (
        <div
          className="absolute top-0 w-full bg-gray-800 transition-all duration-300 dark:bg-gray-900"
          style={{
            height: `${blackPercentage}%`,
            minHeight: blackPercentage > 0 ? "4px" : "0",
          }}
        />
      )}
      {/* Evaluation text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <span
          className={`text-xs font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] ${
            normalizedEval < -0.1 ? "text-white" : "text-foreground"
          }`}
        >
          {formatEval()}
        </span>
      </div>
      {/* Center line */}
      <div className="bg-border absolute top-1/2 right-0 left-0 h-0.5 opacity-50" />
    </div>
  );
};
