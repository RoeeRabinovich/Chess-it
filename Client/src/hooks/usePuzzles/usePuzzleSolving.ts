import { useState, useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { MoveData } from "../../types/chess";
import { Puzzle } from "../../services/puzzleService/puzzleService";
import { triggerConfetti } from "../../utils/confettiUtils";
import {
  executeComputerMove,
  executeUserMove,
  validateMove,
  handlePuzzleCompletion,
  handleWrongMove,
} from "../../utils/puzzleMoveUtils";

interface UsePuzzleSolvingProps {
  currentPuzzle: Puzzle | null;
  puzzlePosition: string;
  setPuzzlePosition: (position: string) => void;
  onPuzzleSolved: (solveTimeSeconds: number) => void;
  onWrongMove: () => void;
}

interface UsePuzzleSolvingReturn {
  currentMoveIndex: number;
  wrongMoveSquare: string | null;
  isPuzzleSolved: boolean;
  puzzleStartTime: number | null;
  puzzleCompletionTime: number | null;
  positionBeforeWrongMove: string | null;
  chessRef: React.MutableRefObject<Chess | null>;
  handleMove: (move: MoveData) => boolean;
  playComputerMoveAt: (moveIndex: number, position?: string) => void;
  handleTryAgain: () => void;
  resetSolvingState: () => void;
  setCurrentMoveIndex: (index: number) => void;
  setIsPuzzleSolved: (solved: boolean) => void;
  setPuzzleStartTime: (time: number | null) => void;
  setPuzzleCompletionTime: (time: number | null) => void;
}

export const usePuzzleSolving = ({
  currentPuzzle,
  puzzlePosition,
  setPuzzlePosition,
  onPuzzleSolved,
  onWrongMove,
}: UsePuzzleSolvingProps): UsePuzzleSolvingReturn => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [wrongMoveSquare, setWrongMoveSquare] = useState<string | null>(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState<number | null>(null);
  const [puzzleCompletionTime, setPuzzleCompletionTime] = useState<
    number | null
  >(null);
  const [positionBeforeWrongMove, setPositionBeforeWrongMove] = useState<
    string | null
  >(null);
  const chessRef = useRef<Chess | null>(null);

  // Initialize and update chess instance
  useEffect(() => {
    if (!chessRef.current && puzzlePosition) {
      chessRef.current = new Chess(puzzlePosition);
    } else if (puzzlePosition && chessRef.current) {
      try {
        chessRef.current.load(puzzlePosition);
      } catch (error) {
        console.error("Error loading position into chess instance:", error);
      }
    }
  }, [puzzlePosition]);

  // Reset solving state
  const resetSolvingState = useCallback(() => {
    setCurrentMoveIndex(0);
    setWrongMoveSquare(null);
    setIsPuzzleSolved(false);
    setPositionBeforeWrongMove(null);
    setPuzzleCompletionTime(null);
  }, []);

  // Play computer move automatically at a specific index
  const playComputerMoveAt = useCallback(
    (moveIndex: number, position?: string) => {
      if (!currentPuzzle || !chessRef.current || isPuzzleSolved) return;

      const moves = currentPuzzle.moves;
      if (moveIndex < moves.length) {
        const computerMoveUCI = moves[moveIndex];
        const positionToUse = position || puzzlePosition;

        setTimeout(() => {
          if (chessRef.current) {
            try {
              chessRef.current.load(positionToUse);
              const newPosition = executeComputerMove(
                chessRef.current,
                computerMoveUCI,
              );

              if (newPosition) {
                setPuzzlePosition(newPosition);
                const nextUserMoveIndex = moveIndex + 1;
                setCurrentMoveIndex(nextUserMoveIndex);

                // Check if puzzle is complete after computer move
                if (nextUserMoveIndex >= moves.length) {
                  handlePuzzleCompletion(
                    puzzleStartTime,
                    onPuzzleSolved,
                    setPuzzleCompletionTime,
                    setIsPuzzleSolved,
                    triggerConfetti,
                  );
                }
              }
            } catch (error) {
              console.error("Error playing computer move:", error);
            }
          }
        }, 300);
      }
    },
    [
      currentPuzzle,
      isPuzzleSolved,
      puzzlePosition,
      puzzleStartTime,
      setPuzzlePosition,
      onPuzzleSolved,
    ],
  );

  // Move handler with validation
  const handleMove = useCallback(
    (move: MoveData): boolean => {
      if (!currentPuzzle) return false;
      if (positionBeforeWrongMove !== null) return false;
      if (isPuzzleSolved) return false;

      const moves = currentPuzzle.moves;
      const expectedMoveUCI = moves[currentMoveIndex];

      if (validateMove(move, expectedMoveUCI)) {
        // Correct move
        setWrongMoveSquare(null);
        setPositionBeforeWrongMove(null);

        if (chessRef.current) {
          const newPosition = executeUserMove(chessRef.current, move);

          if (newPosition) {
            setPuzzlePosition(newPosition);
            const nextMoveIndex = currentMoveIndex + 1;

            // Check if puzzle is complete
            if (nextMoveIndex >= moves.length) {
              handlePuzzleCompletion(
                puzzleStartTime,
                onPuzzleSolved,
                setPuzzleCompletionTime,
                setIsPuzzleSolved,
                triggerConfetti,
              );
            } else {
              // Play computer's response move
              setCurrentMoveIndex(nextMoveIndex);
              playComputerMoveAt(nextMoveIndex, newPosition);
            }
          } else {
            return false;
          }
        }

        return true;
      } else {
        // Wrong move
        const newPosition = handleWrongMove(
          chessRef.current,
          move,
          setPositionBeforeWrongMove,
          setWrongMoveSquare,
          setPuzzlePosition,
          onWrongMove,
        );
        return newPosition !== null;
      }
    },
    [
      currentPuzzle,
      currentMoveIndex,
      isPuzzleSolved,
      positionBeforeWrongMove,
      puzzleStartTime,
      setPuzzlePosition,
      playComputerMoveAt,
      onPuzzleSolved,
      onWrongMove,
    ],
  );

  // Handle "Try Again" button - revert wrong move
  const handleTryAgain = useCallback(() => {
    if (positionBeforeWrongMove && chessRef.current) {
      chessRef.current.load(positionBeforeWrongMove);
      setPuzzlePosition(positionBeforeWrongMove);
      setWrongMoveSquare(null);
      setPositionBeforeWrongMove(null);
    }
  }, [positionBeforeWrongMove, setPuzzlePosition]);

  return {
    currentMoveIndex,
    wrongMoveSquare,
    isPuzzleSolved,
    puzzleStartTime,
    puzzleCompletionTime,
    positionBeforeWrongMove,
    chessRef,
    handleMove,
    playComputerMoveAt,
    handleTryAgain,
    resetSolvingState,
    setCurrentMoveIndex,
    setIsPuzzleSolved,
    setPuzzleStartTime,
    setPuzzleCompletionTime,
  };
};
