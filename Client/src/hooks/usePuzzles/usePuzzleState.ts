import { useState, useCallback, useEffect, useRef } from "react";
import { Puzzle } from "../../services/puzzleService/puzzleService";
import { getPuzzles } from "../../services/puzzleService/puzzleService";
import { PUZZLE_THEMES } from "../../constants/puzzleThemes";
import { useToast } from "../useToast";

interface UsePuzzleStateProps {
  userRating: number;
}

interface UsePuzzleStateReturn {
  currentPuzzle: Puzzle | null;
  puzzlePosition: string;
  puzzles: Puzzle[];
  puzzleIndex: number;
  isLoading: boolean;
  selectedThemes: string[];
  pendingThemes: string[];
  setCurrentPuzzle: (puzzle: Puzzle | null) => void;
  setPuzzlePosition: (position: string) => void;
  setSelectedThemes: (themes: string[]) => void;
  setPendingThemes: (themes: string[]) => void;
  fetchPuzzles: (themes?: string[]) => Promise<void>;
  loadNextPuzzle: () => void;
  handleThemesChange: (themes: string[]) => void;
  handleThemesApply: () => void;
}

export const usePuzzleState = ({
  userRating,
}: UsePuzzleStateProps): UsePuzzleStateReturn => {
  const { toast } = useToast();
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzlePosition, setPuzzlePosition] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [pendingThemes, setPendingThemes] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false); //a state to check if we are loading more puzzles
  const [hasMorePuzzles, setHasMorePuzzles] = useState(true);
  const hasInitialFetchRef = useRef(false);

  // Initial batch size and threshold for loading more
  const INITIAL_BATCH_SIZE = 5;
  const LOAD_MORE_BATCH_SIZE = 5;
  const LOAD_MORE_THRESHOLD = 2; // Load more when 2 puzzles remaining

  // Fetch puzzles with specified themes (lazy loading)
  const fetchPuzzles = useCallback(
    async (themes?: string[], append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        // Use provided themes or fall back to selectedThemes
        const themesToUse = themes || selectedThemes;
        const themesToFetch =
          themesToUse.length === PUZZLE_THEMES.length
            ? themesToUse
            : themesToUse;

        const batchSize = append ? LOAD_MORE_BATCH_SIZE : INITIAL_BATCH_SIZE;

        const fetchedPuzzles = await getPuzzles({
          rating: userRating,
          themes: themesToFetch,
          count: batchSize,
          themesType: "OR",
        });

        if (fetchedPuzzles.length === 0) {
          if (!append) {
            toast({
              title: "No Puzzles Found",
              description: "Try adjusting your theme selection or rating.",
              variant: "destructive",
            });
          } else {
            setHasMorePuzzles(false);
          }
          return;
        }

        if (append) {
          // Append new puzzles to existing ones
          setPuzzles((prev) => [...prev, ...fetchedPuzzles]);
        } else {
          // Replace puzzles and reset index
          setPuzzles(fetchedPuzzles);
          setPuzzleIndex(0);
          setHasMorePuzzles(true);
          // Load first puzzle
          if (fetchedPuzzles[0]) {
            setCurrentPuzzle(fetchedPuzzles[0]);
            setPuzzlePosition(fetchedPuzzles[0].fen);
          }
        }

        // If we got fewer puzzles than requested, we've reached the end
        if (fetchedPuzzles.length < batchSize) {
          setHasMorePuzzles(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch puzzles";
        if (!append) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [selectedThemes, userRating, toast],
  );

  // Load next puzzle with lazy loading
  const loadNextPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;

    const nextIndex = puzzleIndex + 1;

    // Check if we need to load more puzzles
    const puzzlesRemaining = puzzles.length - nextIndex;
    if (
      puzzlesRemaining <= LOAD_MORE_THRESHOLD &&
      hasMorePuzzles &&
      !isLoadingMore
    ) {
      // Load more puzzles in the background
      fetchPuzzles(selectedThemes, true);
    }

    if (nextIndex >= puzzles.length) {
      // Wait for more puzzles to load if we're loading
      if (isLoadingMore) {
        return;
      }
      // If no more puzzles available, wrap around or show message
      if (!hasMorePuzzles) {
        toast({
          title: "No More Puzzles",
          description:
            "You've completed all available puzzles. Try different themes!",
          variant: "default",
        });
        return;
      }
      return;
    }

    setPuzzleIndex(nextIndex);
    const nextPuzzle = puzzles[nextIndex];
    setCurrentPuzzle(nextPuzzle);
    setPuzzlePosition(nextPuzzle.fen);
  }, [
    puzzles,
    puzzleIndex,
    hasMorePuzzles,
    isLoadingMore,
    selectedThemes,
    fetchPuzzles,
    toast,
  ]);

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

  // Fetch puzzles on initial load
  useEffect(() => {
    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      // Initial fetch with default themes (all theme keys)
      const allThemeKeys = PUZZLE_THEMES.map((theme) => theme.key);
      fetchPuzzles(allThemeKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    currentPuzzle,
    puzzlePosition,
    puzzles,
    puzzleIndex,
    isLoading,
    selectedThemes,
    pendingThemes,
    setCurrentPuzzle,
    setPuzzlePosition,
    setSelectedThemes,
    setPendingThemes,
    fetchPuzzles,
    loadNextPuzzle,
    handleThemesChange,
    handleThemesApply,
  };
};
