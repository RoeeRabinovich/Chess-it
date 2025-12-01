import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Tooltip } from "../../../components/ui/Tooltip";
import { formatTime } from "../utils/formatTime";

interface PuzzleTimerSectionProps {
  isPuzzleSolved: boolean;
  isTimerRunning: boolean;
  formattedTime: string;
  showTryAgain?: boolean;
  onTryAgain?: () => void;
  timeTaken?: number;
  puzzleRating?: number;
  puzzleThemes?: string[];
  onNextPuzzle?: () => void;
}

export const PuzzleTimerSection = ({
  isPuzzleSolved,
  isTimerRunning,
  formattedTime,
  showTryAgain = false,
  onTryAgain,
  timeTaken,
  puzzleRating,
  puzzleThemes = [],
  onNextPuzzle,
}: PuzzleTimerSectionProps) => {
  if (showTryAgain && onTryAgain && !isPuzzleSolved) {
    return (
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
    );
  }

  if (isPuzzleSolved) {
    return (
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

            {timeTaken !== undefined && (
              <div className="mb-2 space-y-0.5 text-xs">
                <p className="text-muted-foreground">
                  <span className="font-semibold">Time:</span>{" "}
                  {formatTime(timeTaken)}
                </p>
                {puzzleRating !== undefined && (
                  <Tooltip
                    content="Difficulty rating. Higher = harder puzzle"
                    side="right"
                  >
                    <p className="text-muted-foreground cursor-default">
                      <span className="font-semibold">Rating:</span>{" "}
                      {puzzleRating}
                    </p>
                  </Tooltip>
                )}
                {puzzleThemes.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold">
                      Themes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {puzzleThemes.map((theme) => (
                        <Tooltip
                          key={theme}
                          content={`This puzzle demonstrates ${theme.toLowerCase()} tactics`}
                          side="top"
                        >
                          <Badge variant="outline" size="sm">
                            {theme}
                          </Badge>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onNextPuzzle && (
              <Button
                onClick={onNextPuzzle}
                className="bg-secondary w-full text-xs"
                variant="ghost"
                size="sm"
              >
                Next Puzzle
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
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
          <div className="text-base font-bold sm:text-lg">{formattedTime}</div>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            {isTimerRunning ? "Solving..." : "Solved"}
          </p>
        </div>
      </div>
    </>
  );
};

