import { useAuth } from "../../../hooks/useAuth";
import { RatingAnimation } from "../../../components/ui/RatingAnimation";
import { Tooltip } from "../../../components/ui/Tooltip";

interface PuzzleRatingSectionProps {
  currentUserRating?: number;
  ratingChange?: number | null;
  initialFen?: string;
}

const getTurnFromFen = (fen: string | undefined): "white" | "black" | null => {
  if (!fen) return null;
  const parts = fen.split(" ");
  if (parts.length < 2) return null;
  return parts[1] === "w" ? "white" : parts[1] === "b" ? "black" : null;
};

export const PuzzleRatingSection = ({
  currentUserRating,
  ratingChange,
  initialFen,
}: PuzzleRatingSectionProps) => {
  const { user } = useAuth();
  const userRating = currentUserRating ?? user?.puzzleRating ?? 600;
  const initialTurn = getTurnFromFen(initialFen);

  return (
    <div className="hidden lg:block">
      <div className="mb-2 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
          Puzzle Rating
        </span>
      </div>
      <div className="mb-3">
        <div className="px-2">
          <Tooltip
            content="Your puzzle solving rating. Improve by solving puzzles correctly!"
            side="right"
          >
            <div>
              {ratingChange !== null && ratingChange !== undefined ? (
                <RatingAnimation
                  startValue={userRating - ratingChange}
                  change={ratingChange}
                  duration={1000}
                />
              ) : (
                <div className="text-xl font-bold">{userRating}</div>
              )}
              <p className="text-muted-foreground text-xs">Your rating</p>
            </div>
          </Tooltip>
        </div>
      </div>
      {initialTurn && (
        <>
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              Turn
            </span>
          </div>
          <div className="mb-3">
            <div className="px-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 shrink-0 border-2 ${
                    initialTurn === "white"
                      ? "border-black bg-white"
                      : "border-white bg-black"
                  }`}
                ></div>
                <span className="text-sm font-semibold">
                  {initialTurn === "white" ? "White" : "Black"} to move
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      <hr className="border-border/30 my-2" />
    </div>
  );
};
