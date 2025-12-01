import { usePuzzleTimer } from "../../../hooks/usePuzzles/usePuzzleTimer";
import { ThemeSelector } from "./ThemeSelector";
import { PuzzleRatingSection } from "./PuzzleRatingSection";
import { PuzzleTimerSection } from "./PuzzleTimerSection";

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
  const { formattedTime } = usePuzzleTimer({
    isRunning: isTimerRunning,
    resetKey: puzzleKey,
  });

  return (
    <div className="bg-card flex h-full max-h-full flex-col overflow-x-hidden overflow-y-auto p-1 sm:p-1.5 lg:p-3">
      <PuzzleRatingSection
        currentUserRating={currentUserRating}
        ratingChange={ratingChange}
        initialFen={initialFen}
      />

      <PuzzleTimerSection
        isPuzzleSolved={isPuzzleSolved}
        isTimerRunning={isTimerRunning}
        formattedTime={formattedTime}
        showTryAgain={showTryAgain}
        onTryAgain={onTryAgain}
        timeTaken={timeTaken}
        puzzleRating={puzzleRating}
        puzzleThemes={puzzleThemes}
        onNextPuzzle={onNextPuzzle}
      />
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
