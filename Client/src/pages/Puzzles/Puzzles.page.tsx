import { useState, useEffect, useRef, useCallback } from "react";
import { PuzzlesLayout } from "./layouts/PuzzlesLayout";
import { PuzzlesSidebar } from "./components/PuzzlesSidebar";
import { PuzzlesTopBar } from "./components/PuzzlesTopBar";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { usePuzzleState } from "../../hooks/usePuzzles/usePuzzleState";
import { usePuzzleSolving } from "../../hooks/usePuzzles/usePuzzleSolving";
import { usePuzzleRating } from "../../hooks/usePuzzles/usePuzzleRating";
import { Chess } from "chess.js";

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

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [boardScale] = useState(1.0);

  // Extract turn from FEN
  const getTurnFromFen = (fen: string): "white" | "black" | null => {
    if (!fen) return null;
    const parts = fen.split(" ");
    if (parts.length < 2) return null;
    const turnChar = parts[1];
    return turnChar === "w" ? "white" : turnChar === "b" ? "black" : null;
  };

  // Determine board flip based on player's color
  const initialPuzzleTurn = currentPuzzle
    ? getTurnFromFen(currentPuzzle.fen)
    : null;
  const isFlipped = initialPuzzleTurn === "white";

  // Track the initial puzzle FEN to detect when a new puzzle loads
  const initialPuzzleFenRef = useRef<string | null>(null);

  // Start timer when puzzle loads (reset when puzzle changes)
  useEffect(() => {
    if (currentPuzzle && currentPuzzle.fen !== initialPuzzleFenRef.current) {
      initialPuzzleFenRef.current = currentPuzzle.fen;
      setIsTimerRunning(true);
      setPuzzleStartTime(Date.now());
      setPuzzleCompletionTime(null);
      resetSolvingState();
      resetRatingState();
      setPuzzlePosition(currentPuzzle.fen);

      // Play computer's first move automatically after position is set
      setTimeout(() => {
        if (!chessRef.current) {
          chessRef.current = new Chess(currentPuzzle.fen);
        }

        if (chessRef.current && currentPuzzle.moves.length > 0) {
          chessRef.current.load(currentPuzzle.fen);

          const firstComputerMove = currentPuzzle.moves[0];
          const from = firstComputerMove.substring(0, 2);
          const to = firstComputerMove.substring(2, 4);
          const promotion =
            firstComputerMove.length > 4 ? firstComputerMove[4] : undefined;

          try {
            const move = chessRef.current.move({
              from: from,
              to: to,
              promotion: promotion as "q" | "r" | "b" | "n" | undefined,
            });

            if (move) {
              setPuzzlePosition(chessRef.current.fen());
              setCurrentMoveIndex(1);
            }
          } catch (error) {
            console.error("Error playing initial computer move:", error);
          }
        }
      }, 100);
    } else if (!currentPuzzle) {
      // No puzzle loaded - stop timer and reset state
      setIsTimerRunning(false);
      setPuzzleStartTime(null);
      setPuzzleCompletionTime(null);
      resetSolvingState();
      resetRatingState();
      setPuzzlePosition(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
    }
  }, [
    currentPuzzle,
    setPuzzlePosition,
    resetSolvingState,
    resetRatingState,
    chessRef,
    setCurrentMoveIndex,
    setPuzzleStartTime,
    setPuzzleCompletionTime,
  ]);

  // Handle timer stop callback
  const handleTimerStop = () => {
    setIsTimerRunning(false);
  };

  // Enhanced loadNextPuzzle that resets solving and rating state
  const handleLoadNextPuzzle = useCallback(() => {
    loadNextPuzzle();
    setIsTimerRunning(true);
    resetSolvingState();
    resetRatingState();

    // Play computer's first move automatically when loading next puzzle
    setTimeout(() => {
      const nextPuzzle = puzzles[(puzzleIndex + 1) % puzzles.length];
      if (nextPuzzle && nextPuzzle.moves.length > 0 && chessRef.current) {
        chessRef.current.load(nextPuzzle.fen);

        const firstComputerMove = nextPuzzle.moves[0];
        const from = firstComputerMove.substring(0, 2);
        const to = firstComputerMove.substring(2, 4);
        const promotion =
          firstComputerMove.length > 4 ? firstComputerMove[4] : undefined;

        try {
          const move = chessRef.current.move({
            from: from,
            to: to,
            promotion: promotion as "q" | "r" | "b" | "n" | undefined,
          });

          if (move) {
            setPuzzlePosition(chessRef.current.fen());
            setCurrentMoveIndex(1);
            setPuzzleStartTime(Date.now());
          }
        } catch (error) {
          console.error(
            "Error playing initial computer move in loadNextPuzzle:",
            error,
          );
        }
      }
    }, 100);
  }, [
    loadNextPuzzle,
    puzzles,
    puzzleIndex,
    chessRef,
    setPuzzlePosition,
    setCurrentMoveIndex,
    setPuzzleStartTime,
    resetSolvingState,
    resetRatingState,
  ]);

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
