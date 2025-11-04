interface EvaluationBarProps {
  evaluation: number;
  possibleMate?: string | null;
  isFlipped?: boolean;
  height?: string | number;
  width?: string | number;
}

export const EvaluationBar = ({
  evaluation,
  possibleMate,
  isFlipped = false,
  height = "100%",
  width,
}: EvaluationBarProps) => {
  // Normalize evaluation: positive is good for white, negative is good for black
  const normalizedEval = isFlipped ? -evaluation : evaluation;

  // Determine if horizontal (width > height) or vertical
  const heightNum =
    typeof height === "number" ? height : parseFloat(height) || 100;
  const widthNum =
    typeof width === "number" ? width : parseFloat(width || "0") || 48;
  const isHorizontal = widthNum > heightNum;

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
  const widthStyle = width
    ? typeof width === "number"
      ? `${width}px`
      : width
    : undefined;

  // For horizontal: white fills from left, black from right (when not flipped)
  // For vertical: white fills from bottom, black from top (when not flipped)
  const whiteFromLeft = isHorizontal && !isFlipped;
  const blackFromRight = isHorizontal && !isFlipped;

  return (
    <div
      className={`border-border bg-muted relative overflow-hidden rounded-lg border-2 ${
        isHorizontal ? "flex-row" : "flex w-12 flex-col"
      }`}
      style={{
        height: heightStyle,
        width: widthStyle || (isHorizontal ? "100%" : undefined),
      }}
    >
      {/* White section */}
      {isHorizontal ? (
        // Horizontal: fill from left or right
        whiteFromLeft ? (
          <div
            className="absolute top-0 left-0 h-full bg-white transition-all duration-300 dark:bg-white"
            style={{
              width: `${whitePercentage}%`,
              minWidth: whitePercentage > 0 ? "4px" : "0",
            }}
          />
        ) : (
          <div
            className="absolute top-0 right-0 h-full bg-white transition-all duration-300 dark:bg-white"
            style={{
              width: `${whitePercentage}%`,
              minWidth: whitePercentage > 0 ? "4px" : "0",
            }}
          />
        )
      ) : // Vertical: fill from bottom or top
      whiteFromBottom ? (
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
      {/* Black section */}
      {isHorizontal ? (
        // Horizontal: fill from right or left
        blackFromRight ? (
          <div
            className="absolute top-0 right-0 h-full bg-gray-800 transition-all duration-300 dark:bg-gray-900"
            style={{
              width: `${blackPercentage}%`,
              minWidth: blackPercentage > 0 ? "4px" : "0",
            }}
          />
        ) : (
          <div
            className="absolute top-0 left-0 h-full bg-gray-800 transition-all duration-300 dark:bg-gray-900"
            style={{
              width: `${blackPercentage}%`,
              minWidth: blackPercentage > 0 ? "4px" : "0",
            }}
          />
        )
      ) : // Vertical: fill from top or bottom
      blackFromBottom ? (
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
          className={`${isHorizontal ? "text-[10px]" : "text-xs"} font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] ${
            normalizedEval < -0.1 ? "text-white" : "text-foreground"
          }`}
        >
          {formatEval()}
        </span>
      </div>
      {/* Center line */}
      {isHorizontal ? (
        <div className="bg-border absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 opacity-50" />
      ) : (
        <div className="bg-border absolute top-1/2 right-0 left-0 h-0.5 opacity-50" />
      )}
    </div>
  );
};
