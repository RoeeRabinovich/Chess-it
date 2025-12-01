import { useState, useEffect, useRef, useCallback } from "react";
import { Puzzle } from "../../../services/puzzleService";
import { Chess } from "chess.js";
import { getTurnFromFen } from "../utils/getTurnFromFen";
import { playComputerMove } from "../utils/playComputerMove";

interface UsePuzzleInitializationProps {
  currentPuzzle: Puzzle | null;
  puzzles: Puzzle[];
  puzzleIndex: number;
  setPuzzlePosition: (position: string) => void;
  resetSolvingState: () => void;
  resetRatingState: () => void;
  chessRef: React.MutableRefObject<Chess | null>;
  setCurrentMoveIndex: (index: number) => void;
  setPuzzleStartTime: (time: number | null) => void;
  setPuzzleCompletionTime: (time: number | null) => void;
  loadNextPuzzle: () => void;
}

interface UsePuzzleInitializationReturn {
  isTimerRunning: boolean;
  isFlipped: boolean;
  handleTimerStop: () => void;
  handleLoadNextPuzzle: () => void;
}

export const usePuzzleInitialization = ({
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
}: UsePuzzleInitializationProps): UsePuzzleInitializationReturn => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const initialPuzzleFenRef = useRef<string | null>(null);

  // Determine board flip based on player's color
  const initialPuzzleTurn = currentPuzzle
    ? getTurnFromFen(currentPuzzle.fen)
    : null;
  const isFlipped = initialPuzzleTurn === "white";

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

        playComputerMove(
          currentPuzzle,
          chessRef,
          setPuzzlePosition,
          setCurrentMoveIndex,
        );
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
  const handleTimerStop = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

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
        playComputerMove(
          nextPuzzle,
          chessRef,
          setPuzzlePosition,
          setCurrentMoveIndex,
          setPuzzleStartTime,
        );
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

  return {
    isTimerRunning,
    isFlipped,
    handleTimerStop,
    handleLoadNextPuzzle,
  };
};
