import { useAuth } from "../../../hooks/useAuth";
import { usePuzzleTimer } from "../../../hooks/usePuzzleTimer";
import { ThemeSelector } from "./ThemeSelector";
import { Button } from "../../../components/ui/Button";
import { RatingAnimation } from "../../../components/ui/RatingAnimation";
import { Badge } from "../../../components/ui/Badge";

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

  // Format time in seconds to MM:SS or HH:MM:SS format
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
    <div className="bg-card flex h-full max-h-full flex-col overflow-x-hidden overflow-y-auto p-1 sm:p-1.5 lg:p-3">
      {/* Desktop: Puzzle Rating & Turn (shown only on desktop) */}
      <div className="hidden lg:block">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
          <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
            Puzzle Rating
          </span>
        </div>
        <div className="mb-3">
          <div className="px-2">
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

      {/* Try Again Button (shown when wrong move is made) */}
      {showTryAgain && onTryAgain && !isPuzzleSolved && (
        <>
          <div className="mb-1.5">
            <div className="px-2">
              <Button
                onClick={onTryAgain}
                className="w-full text-xs"
                variant="destructive"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
          <hr className="border-border/30 my-1.5" />
        </>
      )}

      {/* Timer or Completion Section */}
      {isPuzzleSolved ? (
        <>
          <div className="mb-1.5 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              Solved
            </span>
          </div>
          <div className="mb-2">
            <div className="px-2">
              <div className="mb-1.5 text-lg font-bold text-green-600">
                Puzzle Solved!
              </div>

              {/* Statistics */}
              {timeTaken !== undefined && (
                <div className="mb-2 space-y-0.5 text-xs">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Time:</span>{" "}
                    {formatTime(timeTaken)}
                  </p>
                  {puzzleRating !== undefined && (
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Rating:</span>{" "}
                      {puzzleRating}
                    </p>
                  )}
                  {puzzleThemes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-semibold">
                        Themes:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {puzzleThemes.map((theme) => (
                          <Badge key={theme} variant="outline" size="sm">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Next Puzzle Button */}
              {onNextPuzzle && (
                <Button
                  onClick={onNextPuzzle}
                  className="w-full text-xs"
                  variant="default"
                  size="sm"
                >
                  Next Puzzle
                </Button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isTimerRunning ? "animate-pulse bg-green-500" : "bg-gray-500"
              }`}
            ></div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              Timer
            </span>
          </div>
          <div className="mb-1.5">
            <div className="px-2">
              <div className="text-base font-bold sm:text-lg">
                {formattedTime}
              </div>
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                {isTimerRunning ? "Solving..." : "Solved"}
              </p>
            </div>
          </div>
        </>
      )}
      <hr className="border-border/30 my-1.5" />

      {/* Theme Selector Section */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
          Themes
        </span>
      </div>
      <div className="flex-shrink-0 px-2">
        <ThemeSelector
          selectedThemes={selectedThemes}
          onThemesChange={onThemesChange}
          onThemesApply={onThemesApply}
        />
      </div>
    </div>
  );
};
