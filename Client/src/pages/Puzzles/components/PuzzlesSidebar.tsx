import { useAuth } from "../../../hooks/useAuth";
import { usePuzzleTimer } from "../../../hooks/usePuzzleTimer";
import { ThemeSelector } from "./ThemeSelector";

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
}

export const PuzzlesSidebar = ({
  isTimerRunning,
  puzzleKey,
  selectedThemes,
  onThemesChange,
  onThemesApply,
}: PuzzlesSidebarProps) => {
  const { user } = useAuth();

  // Use custom timer hook
  const { formattedTime } = usePuzzleTimer({
    isRunning: isTimerRunning,
    resetKey: puzzleKey,
  });

  // Get user's puzzle rating (default to 1200 if not set)
  const userRating = user?.puzzleRating ?? 600;

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
          <div className="text-2xl font-bold sm:text-3xl">{userRating}</div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Your current puzzle rating
          </p>
        </div>
      </div>
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />

      {/* Timer Section */}
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
          <div className="text-2xl font-bold sm:text-3xl">{formattedTime}</div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {isTimerRunning ? "Solving puzzle..." : "Puzzle solved"}
          </p>
        </div>
      </div>
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
