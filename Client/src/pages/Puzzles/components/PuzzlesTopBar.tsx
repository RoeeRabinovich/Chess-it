import { RatingAnimation } from "../../../components/ui/RatingAnimation";

interface PuzzlesTopBarProps {
  // Current user rating (for animation)
  currentUserRating?: number;
  // Rating change to display
  ratingChange?: number | null;
  // Initial FEN position to determine which color is to move
  initialFen?: string;
}

export const PuzzlesTopBar = ({
  currentUserRating,
  ratingChange,
  initialFen,
}: PuzzlesTopBarProps) => {
  // Extract turn from FEN (FEN format: "position w/b ..." - second part indicates turn)
  const getTurnFromFen = (
    fen: string | undefined,
  ): "white" | "black" | null => {
    if (!fen) return null;
    const parts = fen.split(" ");
    if (parts.length < 2) return null;
    return parts[1] === "w" ? "white" : parts[1] === "b" ? "black" : null;
  };

  const initialTurn = getTurnFromFen(initialFen);
  const userRating = currentUserRating ?? 600;

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Puzzle Rating */}
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"></div>
        <div>
          {ratingChange !== null && ratingChange !== undefined ? (
            <RatingAnimation
              startValue={userRating - ratingChange}
              change={ratingChange}
              duration={1000}
            />
          ) : (
            <div className="text-base font-bold sm:text-lg">{userRating}</div>
          )}
          <p className="text-muted-foreground text-[9px] sm:text-[10px]">
            Rating
          </p>
        </div>
      </div>

      {/* Turn Indicator */}
      {initialTurn && (
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"></div>
          <div className="flex items-center gap-1">
            <div
              className={`h-2.5 w-2.5 shrink-0 border-2 ${
                initialTurn === "white"
                  ? "border-black bg-white"
                  : "border-white bg-black"
              }`}
            ></div>
            <span className="text-xs font-semibold sm:text-sm">
              {initialTurn === "white" ? "White" : "Black"} to move
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

