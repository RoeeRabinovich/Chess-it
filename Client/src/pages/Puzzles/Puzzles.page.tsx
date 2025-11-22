import { useState, useEffect, useCallback } from "react";
import { PuzzlesLayout } from "./layouts/PuzzlesLayout";
import { PuzzlesSidebar } from "./components/PuzzlesSidebar";
import { MoveData } from "../../types/chess";
import { PUZZLE_THEMES } from "../../constants/puzzleThemes";
import { getPuzzles, Puzzle } from "../../services/puzzleService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

export const Puzzles = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Puzzle state
  // currentPuzzle will be used for puzzle validation logic in future implementation
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzlePosition, setPuzzlePosition] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);

  const [isFlipped] = useState(false);
  const [boardScale] = useState(1.0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  // Applied themes (themes used for fetching puzzles)
  const [selectedThemes, setSelectedThemes] = useState<string[]>(() => {
    return PUZZLE_THEMES.map((theme: { key: string }) => theme.key);
  });
  // Pending themes (themes being selected but not yet applied)
  const [pendingThemes, setPendingThemes] = useState<string[]>(() => {
    return PUZZLE_THEMES.map((theme: { key: string }) => theme.key);
  });

  // Get user's puzzle rating
  const userRating = user?.puzzleRating ?? 600;

  // Fetch puzzles with specified themes
  const fetchPuzzles = useCallback(
    async (themes?: string[]) => {
      setIsLoading(true);
      setPuzzleError(null);
      try {
        // Use provided themes or fall back to selectedThemes
        const themesToUse = themes || selectedThemes;
        // If all themes are selected, pass all theme keys
        // Otherwise, pass the selected themes
        const themesToFetch =
          themesToUse.length === PUZZLE_THEMES.length
            ? themesToUse
            : themesToUse;

        const fetchedPuzzles = await getPuzzles({
          rating: userRating,
          themes: themesToFetch,
          count: 25,
          themesType: "ALL",
          playerMoves: 4,
        });

        if (fetchedPuzzles.length === 0) {
          setPuzzleError("No puzzles found with the selected criteria");
          toast({
            title: "No Puzzles Found",
            description: "Try adjusting your theme selection or rating.",
            variant: "destructive",
          });
          return;
        }

        setPuzzles(fetchedPuzzles);
        setPuzzleIndex(0);
        // Load first puzzle
        if (fetchedPuzzles[0]) {
          setCurrentPuzzle(fetchedPuzzles[0]);
          setPuzzlePosition(fetchedPuzzles[0].fen);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch puzzles";
        setPuzzleError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedThemes, userRating, toast],
  );

  // Fetch puzzles on mount only
  useEffect(() => {
    fetchPuzzles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Start timer when puzzle loads (reset when puzzle changes)
  useEffect(() => {
    setIsTimerRunning(true);
  }, [puzzlePosition]);

  // Placeholder move handler
  const handleMove = (move: MoveData): boolean => {
    // TODO: Implement puzzle move validation
    console.log("Move made:", move);

    // TODO: Check if puzzle is solved after this move
    // For now, this is a placeholder
    // When puzzle is solved, stop the timer
    // setIsPuzzleSolved(true);
    // setIsTimerRunning(false);

    return true;
  };

  // Handle timer stop callback
  const handleTimerStop = () => {
    setIsTimerRunning(false);
  };

  // Handle themes change (preview only, doesn't fetch)
  const handleThemesChange = (themes: string[]) => {
    setPendingThemes(themes);
  };

  // Handle themes apply - fetch new puzzles when button is clicked
  const handleThemesApply = () => {
    setSelectedThemes(pendingThemes);
    // Fetch with the new themes immediately
    fetchPuzzles(pendingThemes);
  };

  // Load next puzzle (for future use when puzzle is solved)
  // This will be called when puzzle is successfully solved
  const loadNextPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;

    const nextIndex = (puzzleIndex + 1) % puzzles.length;
    setPuzzleIndex(nextIndex);
    const nextPuzzle = puzzles[nextIndex];
    setCurrentPuzzle(nextPuzzle);
    setPuzzlePosition(nextPuzzle.fen);
    setIsTimerRunning(true);
  }, [puzzles, puzzleIndex]);

  // Store references for future puzzle solving logic
  // These will be used when implementing puzzle validation
  void currentPuzzle;
  void loadNextPuzzle;

  // Show loading or error state
  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="text-center">
          <div className="bg-muted border-primary mx-auto h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading puzzles...</p>
        </div>
      </div>
    );
  }

  if (puzzleError && puzzles.length === 0) {
    return (
      <div className="bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="text-center">
          <p className="text-destructive mb-2 text-lg font-semibold">Error</p>
          <p className="text-muted-foreground">{puzzleError}</p>
        </div>
      </div>
    );
  }

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
    />
  );

  return (
    <div className="bg-background flex h-screen overflow-hidden pt-16 sm:pt-20 md:pt-24">
      <PuzzlesLayout
        position={puzzlePosition}
        onMove={handleMove}
        isFlipped={isFlipped}
        boardScale={boardScale}
        sidebarContent={sidebarContent}
      />
    </div>
  );
};
