import { useCallback } from "react";
import { PuzzlesLayout } from "./layouts/PuzzlesLayout";
import { PuzzlesSidebar } from "./components/PuzzlesSidebar";
import { PuzzlesTopBar } from "./components/PuzzlesTopBar";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { usePuzzleState } from "../../hooks/usePuzzles/usePuzzleState";
import { usePuzzleSolving } from "../../hooks/usePuzzles/usePuzzleSolving";
import { usePuzzleRating } from "../../hooks/usePuzzles/usePuzzleRating";
import { usePuzzleInitialization } from "./hooks/usePuzzleInitialization";

export const Puzzles = () => {
  const { user } = useAuth();
  const userRating = user?.puzzleRating ?? 600;
  const initialUserRating = user?.puzzleRating ?? 600;

  // Puzzle state hook
  const {
    currentPuzzle,
    puzzlePosition,
    puzzles,
    puzzleIndex,
    isLoading,
    pendingThemes,
    setPuzzlePosition,
    loadNextPuzzle,
    handleThemesChange,
    handleThemesApply,
  } = usePuzzleState({ userRating });

  // Rating hook
  const {
    currentUserRating,
    ratingChange,
    hasWrongMove,
    ratingDeducted,
    setHasWrongMove,
    setRatingDeducted,
    calculateAndUpdateRating,
    resetRatingState,
  } = usePuzzleRating({
    initialRating: initialUserRating,
    userRating: user?.puzzleRating,
  });

  // Solving hook callbacks
  const handlePuzzleSolved = useCallback(
    (solveTimeSeconds: number) => {
      if (!hasWrongMove && currentPuzzle) {
        calculateAndUpdateRating(currentPuzzle, solveTimeSeconds, false);
      }
    },
    [hasWrongMove, currentPuzzle, calculateAndUpdateRating],
  );

  const handleWrongMove = useCallback(() => {
    if (!hasWrongMove && !ratingDeducted && currentPuzzle) {
      setHasWrongMove(true);
      setRatingDeducted(true);
      calculateAndUpdateRating(currentPuzzle, 0, true);
    }
  }, [
    hasWrongMove,
    ratingDeducted,
    currentPuzzle,
    setHasWrongMove,
    setRatingDeducted,
    calculateAndUpdateRating,
  ]);

  // Solving hook
  const {
    wrongMoveSquare,
    isPuzzleSolved,
    puzzleStartTime,
    puzzleCompletionTime,
    positionBeforeWrongMove,
    chessRef,
    handleMove,
    handleTryAgain,
    resetSolvingState,
    setCurrentMoveIndex,
    setPuzzleStartTime,
    setPuzzleCompletionTime,
  } = usePuzzleSolving({
    currentPuzzle,
    puzzlePosition,
    setPuzzlePosition,
    onPuzzleSolved: handlePuzzleSolved,
    onWrongMove: handleWrongMove,
  });

  const boardScale = 1.0;

  // Puzzle initialization hook
  const { isTimerRunning, isFlipped, handleTimerStop, handleLoadNextPuzzle } =
    usePuzzleInitialization({
      currentPuzzle,
      puzzles,
      puzzleIndex,
      setPuzzlePosition,
      resetSolvingState,
      resetRatingState,
      chessRef,
      setCurrentMoveIndex,
      setPuzzleStartTime,
      setPuzzleCompletionTime,
      loadNextPuzzle,
    });

  // Show loading state only when fetching puzzles
  if (isLoading) {
    return <LoadingSpinner fullScreen size="large" text="Loading puzzles..." />;
  }

  // Use stored completion time if puzzle is solved, otherwise calculate current elapsed time
  const timeTaken =
    puzzleCompletionTime !== null
      ? puzzleCompletionTime
      : puzzleStartTime
        ? Math.floor((Date.now() - puzzleStartTime) / 1000)
        : undefined;

  // Top content (Rating & Turn) - shown above board on mobile/tablet
  const topContent = (
    <PuzzlesTopBar
      currentUserRating={currentUserRating}
      ratingChange={ratingChange}
      initialFen={puzzlePosition}
    />
  );

  // Sidebar content with PuzzlesSidebar component
  const sidebarContent = (
    <PuzzlesSidebar
      isTimerRunning={isTimerRunning}
      onTimerStop={handleTimerStop}
      puzzleKey={puzzlePosition}
      selectedThemes={pendingThemes}
      onThemesChange={handleThemesChange}
      onThemesApply={handleThemesApply}
      initialFen={puzzlePosition}
      isPuzzleSolved={isPuzzleSolved}
      timeTaken={timeTaken}
      puzzleRating={currentPuzzle?.rating}
      puzzleThemes={currentPuzzle?.themes}
      onNextPuzzle={currentPuzzle ? handleLoadNextPuzzle : undefined}
      showTryAgain={positionBeforeWrongMove !== null}
      onTryAgain={handleTryAgain}
      currentUserRating={currentUserRating}
      ratingChange={ratingChange}
    />
  );

  return (
    <div className="bg-background flex h-screen overflow-hidden pt-12 sm:pt-14 md:pt-16 lg:pt-20">
      <PuzzlesLayout
        position={puzzlePosition}
        onMove={handleMove}
        isFlipped={isFlipped}
        boardScale={boardScale}
        sidebarContent={sidebarContent}
        wrongMoveSquare={wrongMoveSquare}
        isInteractive={
          currentPuzzle !== null &&
          positionBeforeWrongMove === null &&
          !isPuzzleSolved
        }
        topContent={topContent}
      />
    </div>
  );
};
