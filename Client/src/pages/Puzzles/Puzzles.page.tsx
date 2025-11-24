import { useState, useEffect, useCallback, useRef } from "react";
import { PuzzlesLayout } from "./layouts/PuzzlesLayout";
import { PuzzlesSidebar } from "./components/PuzzlesSidebar";
import { PuzzlesTopBar } from "./components/PuzzlesTopBar";
import { MoveData } from "../../types/chess";
import { PUZZLE_THEMES } from "../../constants/puzzleThemes";
import { getPuzzles, Puzzle } from "../../services/puzzleService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { moveDataToUCI } from "../../utils/chessMoveUtils";
import { Chess } from "chess.js";
import confetti from "canvas-confetti";
import { calculateRatingChange } from "../../utils/puzzleRatingUtils";
import { apiService } from "../../services/api";
import { useAppDispatch } from "../../store/hooks";
import { login as loginAction } from "../../store/authSlice";

export const Puzzles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Puzzle state
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzlePosition, setPuzzlePosition] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);

  // Puzzle solving state
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0); // Track which move in the moves array we're on
  const [wrongMoveSquare, setWrongMoveSquare] = useState<string | null>(null); // Square to highlight red
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState<number | null>(null); // Timestamp when puzzle started
  const [puzzleCompletionTime, setPuzzleCompletionTime] = useState<
    number | null
  >(null); // Time in seconds when puzzle was completed
  const [positionBeforeWrongMove, setPositionBeforeWrongMove] = useState<
    string | null
  >(null); // FEN before wrong move to revert

  // Rating tracking state
  const [hasWrongMove, setHasWrongMove] = useState(false); // Track if wrong move was made (once per puzzle)
  const [ratingDeducted, setRatingDeducted] = useState(false); // Track if rating was already deducted
  const initialUserRating = user?.puzzleRating ?? 600;
  const [currentUserRating, setCurrentUserRating] =
    useState<number>(initialUserRating); // Track current rating for animation
  const [ratingChange, setRatingChange] = useState<number | null>(null); // Rating change to display

  const [boardScale] = useState(1.0);

  // Extract turn from FEN
  const getTurnFromFen = (fen: string): "white" | "black" | null => {
    if (!fen) return null;
    const parts = fen.split(" ");
    if (parts.length < 2) return null;
    // FEN format: "position turn ..." where turn is "w" (white) or "b" (black)
    const turnChar = parts[1];
    console.log("FEN turn character:", turnChar, "from FEN:", fen);
    return turnChar === "w" ? "white" : turnChar === "b" ? "black" : null;
  };

  // Determine board flip based on player's color (who moves second)
  // The puzzle FEN shows the position before the computer's first move
  // - If initial turn is "white": Computer (white) moves first, Player (black) moves second → Flip board
  // - If initial turn is "black": Computer (black) moves first, Player (white) moves second → Don't flip
  const initialPuzzleTurn = currentPuzzle
    ? getTurnFromFen(currentPuzzle.fen)
    : null;
  // Flip when initial turn is white (because player is black and moves second)
  const isFlipped = initialPuzzleTurn === "white";
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  // Applied themes (themes used for fetching puzzles)
  // Default: Only select themes from "Themes" category (tactical + checkmate)
  const [selectedThemes, setSelectedThemes] = useState<string[]>(() => {
    return PUZZLE_THEMES.filter(
      (theme) =>
        theme.category === "tactical" || theme.category === "checkmate",
    ).map((theme) => theme.key);
  });
  // Pending themes (themes being selected but not yet applied)
  const [pendingThemes, setPendingThemes] = useState<string[]>(() => {
    return PUZZLE_THEMES.filter(
      (theme) =>
        theme.category === "tactical" || theme.category === "checkmate",
    ).map((theme) => theme.key);
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
          count: 15,
          themesType: "OR", // Use "OR" to find puzzles with any of the selected themes (API expects "ALL" or "OR")
          // playerMoves will be determined automatically from difficulty themes if selected
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
          // Reset puzzle solving state
          setCurrentMoveIndex(0);
          setWrongMoveSquare(null);
          setIsPuzzleSolved(false);
          setPuzzleStartTime(Date.now());
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

  // Sync currentUserRating with user object when it updates from the database
  useEffect(() => {
    if (
      user?.puzzleRating !== undefined &&
      user.puzzleRating !== currentUserRating
    ) {
      // Update local state to match the user object (which gets updated after API call)
      setCurrentUserRating(user.puzzleRating);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.puzzleRating]);

  // Fetch puzzles on mount only
  useEffect(() => {
    fetchPuzzles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Track the initial puzzle FEN to detect when a new puzzle loads
  const initialPuzzleFenRef = useRef<string | null>(null);

  // Start timer when puzzle loads (reset when puzzle changes)
  useEffect(() => {
    // Only reset if this is a new puzzle (different initial FEN)
    if (currentPuzzle && currentPuzzle.fen !== initialPuzzleFenRef.current) {
      initialPuzzleFenRef.current = currentPuzzle.fen;
      setIsTimerRunning(true);
      setPuzzleStartTime(Date.now());
      setPuzzleCompletionTime(null); // Reset completion time for new puzzle
      // Start at index 0 - moves[0] is computer's first move (not played yet)
      setCurrentMoveIndex(0);
      setWrongMoveSquare(null);
      setIsPuzzleSolved(false);
      setPositionBeforeWrongMove(null);
      // Reset rating tracking for new puzzle
      setHasWrongMove(false);
      setRatingDeducted(false);
      setRatingChange(null);
      // Note: currentUserRating persists across puzzles to maintain the updated rating

      // Set initial position first
      setPuzzlePosition(currentPuzzle.fen);

      // Play computer's first move automatically after position is set
      // Use setTimeout to ensure state update is processed first
      setTimeout(() => {
        if (chessRef.current && currentPuzzle.moves.length > 0) {
          // Ensure chess instance has the correct position
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
              // After computer plays, next is user's move at index 1
              setCurrentMoveIndex(1);
            }
          } catch (error) {
            console.error("Error playing initial computer move:", error);
            console.error("FEN:", currentPuzzle.fen);
            console.error("Move:", firstComputerMove);
            console.error("Chess instance FEN:", chessRef.current.fen());
          }
        }
      }, 100); // Small delay to ensure position is loaded
    }
  }, [currentPuzzle]);

  // Chess instance ref for making moves
  const chessRef = useRef<Chess | null>(null);

  // Initialize chess instance on mount
  useEffect(() => {
    if (!chessRef.current && puzzlePosition) {
      chessRef.current = new Chess(puzzlePosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once on mount

  // Update chess instance when position changes
  useEffect(() => {
    if (puzzlePosition && chessRef.current) {
      try {
        chessRef.current.load(puzzlePosition);
      } catch (error) {
        console.error("Error loading position into chess instance:", error);
      }
    }
  }, [puzzlePosition]);

  // Trigger confetti animation
  const triggerConfetti = useCallback(() => {
    // Get theme colors (you can customize these)
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0 },
      colors: colors,
    });

    // Continue confetti for 3 seconds
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors,
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  // Play computer move automatically at a specific index
  const playComputerMoveAt = useCallback(
    (moveIndex: number, position?: string) => {
      if (!currentPuzzle || !chessRef.current || isPuzzleSolved) return;

      const moves = currentPuzzle.moves;
      // moveIndex is the computer move index (even number: 0, 2, 4, 6...)
      // After playing it, we'll increment to next user move (odd number: 1, 3, 5, 7...)

      // Check if there's a computer move to play
      if (moveIndex < moves.length) {
        const computerMoveUCI = moves[moveIndex];

        // Parse UCI move (format: "e2e4" or "e7e8q")
        const from = computerMoveUCI.substring(0, 2);
        const to = computerMoveUCI.substring(2, 4);
        const promotion =
          computerMoveUCI.length > 4 ? computerMoveUCI[4] : undefined;

        // Use provided position or fall back to puzzlePosition from closure
        const positionToUse = position || puzzlePosition;

        // Wait 300ms for animation delay
        setTimeout(() => {
          if (chessRef.current) {
            try {
              // Ensure chess instance has the current position before making move
              chessRef.current.load(positionToUse);

              const move = chessRef.current.move({
                from: from,
                to: to,
                promotion: promotion as "q" | "r" | "b" | "n" | undefined,
              });

              if (move) {
                setPuzzlePosition(chessRef.current.fen());
                const nextUserMoveIndex = moveIndex + 1;
                setCurrentMoveIndex(nextUserMoveIndex);

                // Check if puzzle is complete after computer move
                // If next user move index is beyond array, puzzle is complete
                if (nextUserMoveIndex >= moves.length) {
                  setIsPuzzleSolved(true);
                  setIsTimerRunning(false);

                  // Store completion time
                  if (puzzleStartTime) {
                    const solveTimeSeconds = Math.floor(
                      (Date.now() - puzzleStartTime) / 1000,
                    );
                    setPuzzleCompletionTime(solveTimeSeconds);
                  }

                  triggerConfetti();

                  // Add rating if puzzle was solved without mistakes
                  // Note: This handles the case where puzzle ends after computer's move
                  if (!hasWrongMove && currentPuzzle && puzzleStartTime) {
                    const solveTimeSeconds = Math.floor(
                      (Date.now() - puzzleStartTime) / 1000,
                    );
                    const change = calculateRatingChange(
                      currentUserRating,
                      currentPuzzle.rating,
                      false, // no wrong move
                      solveTimeSeconds,
                    );

                    const newRating = Math.max(0, currentUserRating + change);
                    setCurrentUserRating(newRating);
                    setRatingChange(change);

                    // Update database and user object
                    console.log("Updating puzzle rating to:", newRating);
                    apiService
                      .updatePuzzleRating(newRating)
                      .then((updatedUser) => {
                        console.log(
                          "Rating updated successfully:",
                          updatedUser.puzzleRating,
                        );
                        // Update Redux store
                        dispatch(loginAction(updatedUser));
                        // Update localStorage
                        localStorage.setItem(
                          "user",
                          JSON.stringify(updatedUser),
                        );
                        // Sync local state with updated user
                        if (updatedUser.puzzleRating !== undefined) {
                          setCurrentUserRating(updatedUser.puzzleRating);
                        }
                      })
                      .catch((error) => {
                        console.error("Error updating puzzle rating:", error);
                        toast({
                          title: "Error",
                          description:
                            "Failed to save rating. Please try again.",
                          variant: "destructive",
                        });
                      });
                  }
                }
              }
            } catch (error) {
              console.error("Error playing computer move:", error);
              console.error("Move:", computerMoveUCI);
              console.error("Move Index:", moveIndex);
              console.error("Position used:", positionToUse);
              console.error("Chess instance FEN:", chessRef.current.fen());
            }
          }
        }, 300);
      }
    },
    [
      currentPuzzle,
      isPuzzleSolved,
      triggerConfetti,
      puzzlePosition,
      currentUserRating,
      hasWrongMove,
      puzzleStartTime,
      dispatch,
    ],
  );

  // Move handler with validation
  const handleMove = useCallback(
    (move: MoveData): boolean => {
      // Prevent moves if there's a wrong move pending (user must click "Try Again" first)
      if (positionBeforeWrongMove !== null) {
        return false;
      }
      if (!currentPuzzle || isPuzzleSolved) return false;

      const moves = currentPuzzle.moves;
      const expectedMoveUCI = moves[currentMoveIndex];
      const userMoveUCI = moveDataToUCI(move);

      // Validate move
      if (userMoveUCI === expectedMoveUCI) {
        // Correct move
        setWrongMoveSquare(null);
        setPositionBeforeWrongMove(null); // Clear any saved wrong move position

        // Update position
        if (chessRef.current) {
          try {
            const chessMove = chessRef.current.move({
              from: move.from,
              to: move.to,
              promotion: move.promotion as "q" | "r" | "b" | "n" | undefined,
            });

            if (chessMove) {
              const newPosition = chessRef.current.fen();
              setPuzzlePosition(newPosition);
              const nextMoveIndex = currentMoveIndex + 1;

              // Check if puzzle is complete (if this was the last user move)
              if (nextMoveIndex >= moves.length) {
                setIsPuzzleSolved(true);
                setIsTimerRunning(false);

                // Store completion time
                if (puzzleStartTime) {
                  const solveTimeSeconds = Math.floor(
                    (Date.now() - puzzleStartTime) / 1000,
                  );
                  setPuzzleCompletionTime(solveTimeSeconds);
                }

                triggerConfetti();

                // Add rating if puzzle was solved without mistakes
                if (!hasWrongMove && currentPuzzle && puzzleStartTime) {
                  const solveTimeSeconds = Math.floor(
                    (Date.now() - puzzleStartTime) / 1000,
                  );
                  const change = calculateRatingChange(
                    currentUserRating,
                    currentPuzzle.rating,
                    false, // no wrong move
                    solveTimeSeconds,
                  );

                  const newRating = Math.max(0, currentUserRating + change);
                  setCurrentUserRating(newRating);
                  setRatingChange(change);

                  // Update database and user object
                  console.log("Updating puzzle rating to:", newRating);
                  apiService
                    .updatePuzzleRating(newRating)
                    .then((updatedUser) => {
                      console.log(
                        "Rating updated successfully:",
                        updatedUser.puzzleRating,
                      );
                      // Update Redux store
                      dispatch(loginAction(updatedUser));
                      // Update localStorage
                      localStorage.setItem("user", JSON.stringify(updatedUser));
                      // Sync local state with updated user
                      if (updatedUser.puzzleRating !== undefined) {
                        setCurrentUserRating(updatedUser.puzzleRating);
                      }
                    })
                    .catch((error) => {
                      console.error("Error updating puzzle rating:", error);
                      toast({
                        title: "Error",
                        description: "Failed to save rating. Please try again.",
                        variant: "destructive",
                      });
                    });
                }
              } else {
                // Play computer's response move (at nextMoveIndex, which is even: 2, 4, 6...)
                // Update state first, then play computer move with the new position
                setCurrentMoveIndex(nextMoveIndex);
                // Pass both the index and the new position to avoid stale closure
                playComputerMoveAt(nextMoveIndex, newPosition);
              }
            }
          } catch (error) {
            console.error("Error making move:", error);
            return false;
          }
        }

        return true;
      } else {
        // Wrong move - save position before the move and highlight the square
        if (chessRef.current) {
          // Save position before making the wrong move
          setPositionBeforeWrongMove(chessRef.current.fen());
        }
        setWrongMoveSquare(move.to);

        // Mark that wrong move was made (only once per puzzle)
        if (!hasWrongMove && !ratingDeducted && currentPuzzle) {
          setHasWrongMove(true);
          setRatingDeducted(true);

          // Deduct rating immediately on first wrong move
          const change = calculateRatingChange(
            currentUserRating,
            currentPuzzle.rating,
            true, // hasWrongMove
            0, // solveTime not relevant for wrong move
          );

          const newRating = Math.max(0, currentUserRating + change); // Prevent negative rating
          setCurrentUserRating(newRating);
          setRatingChange(change);

          // Update database and user object
          console.log("Updating puzzle rating to:", newRating);
          apiService
            .updatePuzzleRating(newRating)
            .then((updatedUser) => {
              console.log(
                "Rating updated successfully:",
                updatedUser.puzzleRating,
              );
              // Update Redux store
              dispatch(loginAction(updatedUser));
              // Update localStorage
              localStorage.setItem("user", JSON.stringify(updatedUser));
              // Sync local state with updated user
              if (updatedUser.puzzleRating !== undefined) {
                setCurrentUserRating(updatedUser.puzzleRating);
              }
            })
            .catch((error) => {
              console.error("Error updating puzzle rating:", error);
              toast({
                title: "Error",
                description: "Failed to save rating. Please try again.",
                variant: "destructive",
              });
            });
        }

        // Still allow the move to be made (as per requirements)
        if (chessRef.current) {
          try {
            const chessMove = chessRef.current.move({
              from: move.from,
              to: move.to,
              promotion: move.promotion as "q" | "r" | "b" | "n" | undefined,
            });

            if (chessMove) {
              setPuzzlePosition(chessRef.current.fen());
            }
          } catch (error) {
            console.error("Error making wrong move:", error);
            return false;
          }
        }

        return true;
      }
    },
    [
      currentPuzzle,
      currentMoveIndex,
      isPuzzleSolved,
      triggerConfetti,
      playComputerMoveAt,
      positionBeforeWrongMove,
      currentUserRating,
      hasWrongMove,
      puzzleStartTime,
      ratingDeducted,
      dispatch,
    ],
  );

  // Handle timer stop callback
  const handleTimerStop = () => {
    setIsTimerRunning(false);
  };

  // Handle "Try Again" button - revert wrong move
  const handleTryAgain = useCallback(() => {
    if (positionBeforeWrongMove && chessRef.current) {
      // Revert to position before wrong move
      chessRef.current.load(positionBeforeWrongMove);
      setPuzzlePosition(positionBeforeWrongMove);
      // Clear wrong move indication and saved position
      setWrongMoveSquare(null);
      setPositionBeforeWrongMove(null);
    }
  }, [positionBeforeWrongMove]);

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

  // Load next puzzle
  const loadNextPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;

    const nextIndex = (puzzleIndex + 1) % puzzles.length;
    setPuzzleIndex(nextIndex);
    const nextPuzzle = puzzles[nextIndex];
    setCurrentPuzzle(nextPuzzle);
    setPuzzlePosition(nextPuzzle.fen);
    setIsTimerRunning(true);
    // Reset puzzle solving state
    // Start at index 0 - moves[0] is computer's first move (will be played automatically)
    setCurrentMoveIndex(0);
    setWrongMoveSquare(null);
    setIsPuzzleSolved(false);
    setPuzzleStartTime(Date.now());
    setPositionBeforeWrongMove(null);
    // Reset rating tracking for new puzzle
    setHasWrongMove(false);
    setRatingDeducted(false);
    setRatingChange(null);

    // Play computer's first move automatically when loading next puzzle
    // Use setTimeout to ensure state updates are processed first
    setTimeout(() => {
      if (nextPuzzle && nextPuzzle.moves.length > 0 && chessRef.current) {
        // Load FEN first
        chessRef.current.load(nextPuzzle.fen);

        const firstComputerMove = nextPuzzle.moves[0];
        const from = firstComputerMove.substring(0, 2);
        const to = firstComputerMove.substring(2, 4);
        const promotion =
          firstComputerMove.length > 4 ? firstComputerMove[4] : undefined;

        try {
          // Now play the computer move
          const move = chessRef.current.move({
            from: from,
            to: to,
            promotion: promotion as "q" | "r" | "b" | "n" | undefined,
          });

          if (move) {
            setPuzzlePosition(chessRef.current.fen());
            // After computer plays, next is user's move at index 1
            setCurrentMoveIndex(1);
          }
        } catch (error) {
          console.error(
            "Error playing initial computer move in loadNextPuzzle:",
            error,
          );
          console.error("FEN:", nextPuzzle.fen);
          console.error("Move:", firstComputerMove);
          console.error("Chess instance FEN:", chessRef.current.fen());
        }
      }
    }, 100); // Small delay to ensure position is set
  }, [puzzles, puzzleIndex]);

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
      onNextPuzzle={loadNextPuzzle}
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
        isInteractive={positionBeforeWrongMove === null && !isPuzzleSolved}
        topContent={topContent}
      />
    </div>
  );
};
