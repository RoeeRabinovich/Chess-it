import { useAuth } from "../../../hooks/useAuth";
import { usePuzzleTimer } from "../../../hooks/usePuzzleTimer";
import { ThemeSelector } from "./ThemeSelector";
import { Button } from "../../../components/ui/Button";
import { RatingAnimation } from "../../../components/ui/RatingAnimation";

interface PuzzlesSidebarProps {
  // Timer state
  isTimerRunning: boolean;
  onTimerStop?: () => void;
  // Puzzle ID or key to reset timer when puzzle changes
  puzzleKey?: string | number;
  // Selected themes
  selectedThemes: string[];
  // Callback when themes change
  onThemesChange: (themes: string[]) => void;
  // Callback when "Set Themes" button is clicked
  onThemesApply: () => void;
  // Initial FEN position to determine which color is to move
  initialFen?: string;
  // Puzzle completion state
  isPuzzleSolved?: boolean;
  // Time taken to solve (in seconds)
  timeTaken?: number;
  // Puzzle rating
  puzzleRating?: number;
  // Puzzle difficulty/themes
  puzzleThemes?: string[];
  // Callback to load next puzzle
  onNextPuzzle?: () => void;
  // Show "Try Again" button (when wrong move was made)
  showTryAgain?: boolean;
  // Callback to revert wrong move
  onTryAgain?: () => void;
  // Current user rating (for animation)
  currentUserRating?: number;
  // Rating change to display
  ratingChange?: number | null;
}

export const PuzzlesSidebar = ({
  isTimerRunning,
  puzzleKey,
  selectedThemes,
  onThemesChange,
  onThemesApply,
  initialFen,
  isPuzzleSolved = false,
  timeTaken,
  puzzleRating,
  puzzleThemes = [],
  onNextPuzzle,
  showTryAgain = false,
  onTryAgain,
  currentUserRating,
  ratingChange,
}: PuzzlesSidebarProps) => {
  const { user } = useAuth();

  // Use custom timer hook
  const { formattedTime } = usePuzzleTimer({
    isRunning: isTimerRunning,
    resetKey: puzzleKey,
  });

  // Get user's puzzle rating - use currentUserRating if provided, otherwise fall back
  const userRating = currentUserRating ?? user?.puzzleRating ?? 600;

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

  return (
    <div className="bg-card flex h-full max-h-full flex-col overflow-hidden p-1.5 sm:p-2 lg:p-4">
      {/* Puzzle Rating Section */}
      <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2"></div>
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          Puzzle Rating
        </span>
      </div>
      <div className="mb-2 sm:mb-3 lg:mb-4">
        <div className="px-2 sm:px-3">
          {ratingChange !== null && ratingChange !== undefined ? (
            <RatingAnimation
              startValue={userRating - ratingChange}
              change={ratingChange}
              duration={1000}
            />
          ) : (
            <div className="text-2xl font-bold sm:text-3xl">{userRating}</div>
          )}
          <p className="text-muted-foreground text-xs sm:text-sm">
            Your current puzzle rating
          </p>
        </div>
      </div>
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />

      {/* Move Indicator Section */}
      {initialTurn && (
        <>
          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 sm:h-2 sm:w-2"></div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
              Turn
            </span>
          </div>
          <div className="mb-2 sm:mb-3 lg:mb-4">
            <div className="px-2 sm:px-3">
              <div className="flex items-center gap-2">
                {/* Square indicator */}
                <div
                  className={`h-4 w-4 shrink-0 border-2 ${
                    initialTurn === "white"
                      ? "border-black bg-white"
                      : "border-white bg-black"
                  }`}
                ></div>
                {/* Text */}
                <span className="text-lg font-semibold sm:text-xl">
                  {initialTurn === "white" ? "White" : "Black"} to move
                </span>
              </div>
            </div>
          </div>
          <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />
        </>
      )}

      {/* Try Again Button (shown when wrong move is made) */}
      {showTryAgain && onTryAgain && !isPuzzleSolved && (
        <>
          <div className="mb-2 sm:mb-3 lg:mb-4">
            <div className="px-2 sm:px-3">
              <Button
                onClick={onTryAgain}
                className="w-full"
                variant="destructive"
              >
                Try Again
              </Button>
              <p className="text-muted-foreground mt-1 text-xs">
                Revert your last move
              </p>
            </div>
          </div>
          <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />
        </>
      )}

      {/* Timer or Completion Section */}
      {isPuzzleSolved ? (
        <>
          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 sm:h-2 sm:w-2"></div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
              Puzzle Solved
            </span>
          </div>
          <div className="mb-2 sm:mb-3 lg:mb-4">
            <div className="px-2 sm:px-3">
              <div className="mb-2 text-2xl font-bold text-green-600 sm:text-3xl">
                Puzzle Solved!
              </div>

              {/* Statistics */}
              {timeTaken !== undefined && (
                <div className="mb-2 space-y-1">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    <span className="font-semibold">Time:</span> {formattedTime}
                  </p>
                  {puzzleRating !== undefined && (
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      <span className="font-semibold">Rating:</span>{" "}
                      {puzzleRating}
                    </p>
                  )}
                  {puzzleThemes.length > 0 && (
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      <span className="font-semibold">Themes:</span>{" "}
                      {puzzleThemes.slice(0, 3).join(", ")}
                      {puzzleThemes.length > 3 && "..."}
                    </p>
                  )}
                </div>
              )}

              {/* Next Puzzle Button */}
              {onNextPuzzle && (
                <Button
                  onClick={onNextPuzzle}
                  className="w-full"
                  variant="default"
                >
                  Next Puzzle
                </Button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
            <div
              className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                isTimerRunning ? "animate-pulse bg-green-500" : "bg-gray-500"
              }`}
            ></div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
              Timer
            </span>
          </div>
          <div className="mb-2 sm:mb-3 lg:mb-4">
            <div className="px-2 sm:px-3">
              <div className="text-2xl font-bold sm:text-3xl">
                {formattedTime}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {isTimerRunning ? "Solving puzzle..." : "Puzzle solved"}
              </p>
            </div>
          </div>
        </>
      )}
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />

      {/* Theme Selector Section */}
      <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 sm:h-2 sm:w-2"></div>
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          Themes
        </span>
      </div>
      <div className="mb-2 flex-shrink-0 px-2 sm:mb-3 sm:px-3 lg:mb-4">
        <ThemeSelector
          selectedThemes={selectedThemes}
          onThemesChange={onThemesChange}
          onThemesApply={onThemesApply}
        />
      </div>
    </div>
  );
};
