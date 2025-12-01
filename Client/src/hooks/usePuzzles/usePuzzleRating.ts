import { useState, useEffect } from "react";
import { useAppDispatch } from "../../store/hooks";
import { login as loginAction } from "../../store/authSlice";
import { userService } from "../../services/userService";
import { useToast } from "../useToast";
import { calculateRatingChange } from "../../utils/puzzleRatingUtils";
import { Puzzle } from "../../services/puzzleService/puzzleService";

interface UsePuzzleRatingProps {
  initialRating: number;
  userRating?: number;
}

interface UsePuzzleRatingReturn {
  currentUserRating: number;
  ratingChange: number | null;
  hasWrongMove: boolean;
  ratingDeducted: boolean;
  setHasWrongMove: (value: boolean) => void;
  setRatingDeducted: (value: boolean) => void;
  setRatingChange: (change: number | null) => void;
  calculateAndUpdateRating: (
    puzzle: Puzzle,
    solveTimeSeconds: number,
    hasWrongMove: boolean,
  ) => void;
  resetRatingState: () => void;
}

export const usePuzzleRating = ({
  initialRating,
  userRating,
}: UsePuzzleRatingProps): UsePuzzleRatingReturn => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [currentUserRating, setCurrentUserRating] =
    useState<number>(initialRating);
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [hasWrongMove, setHasWrongMove] = useState(false);
  const [ratingDeducted, setRatingDeducted] = useState(false);

  // Sync currentUserRating with user object when it updates from the database
  useEffect(() => {
    if (userRating !== undefined && userRating !== currentUserRating) {
      setCurrentUserRating(userRating);
    }
  }, [userRating, currentUserRating]);

  // Calculate and update rating
  const calculateAndUpdateRating = (
    puzzle: Puzzle,
    solveTimeSeconds: number,
    hasWrongMoveFlag: boolean,
  ) => {
    const change = calculateRatingChange(
      currentUserRating,
      puzzle.rating,
      hasWrongMoveFlag,
      solveTimeSeconds,
    );

    const newRating = Math.max(0, currentUserRating + change);
    setCurrentUserRating(newRating);
    setRatingChange(change);

    // Update database and user object
    console.log("Updating puzzle rating to:", newRating);
    userService
      .updatePuzzleRating(newRating)
      .then((updatedUser) => {
        console.log("Rating updated successfully:", updatedUser.puzzleRating);
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
  };

  const resetRatingState = () => {
    setHasWrongMove(false);
    setRatingDeducted(false);
    setRatingChange(null);
  };

  return {
    currentUserRating,
    ratingChange,
    hasWrongMove,
    ratingDeducted,
    setHasWrongMove,
    setRatingDeducted,
    setRatingChange,
    calculateAndUpdateRating,
    resetRatingState,
  };
};
