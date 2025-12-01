import { useState, useCallback } from "react";
import { Puzzle } from "../../services/puzzleService";
import { getPuzzles } from "../../services/puzzleService";
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

  // Fetch puzzles with specified themes
  const fetchPuzzles = useCallback(
    async (themes?: string[]) => {
      setIsLoading(true);
      try {
        // Use provided themes or fall back to selectedThemes
        const themesToUse = themes || selectedThemes;
        const themesToFetch =
          themesToUse.length === PUZZLE_THEMES.length
            ? themesToUse
            : themesToUse;

        const fetchedPuzzles = await getPuzzles({
          rating: userRating,
          themes: themesToFetch,
          count: 15,
          themesType: "OR",
        });

        if (fetchedPuzzles.length === 0) {
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

  // Load next puzzle
  const loadNextPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;

    const nextIndex = (puzzleIndex + 1) % puzzles.length;
    setPuzzleIndex(nextIndex);
    const nextPuzzle = puzzles[nextIndex];
    setCurrentPuzzle(nextPuzzle);
    setPuzzlePosition(nextPuzzle.fen);
  }, [puzzles, puzzleIndex]);

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
