import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorHandler } from "../../components/ErrorHandler/ErrorHandler";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { MobileStudyLayout } from "../CreateStudy/layouts/MobileStudyLayout";
import { DesktopStudyLayout } from "../CreateStudy/layouts/DesktopStudyLayout";
import { getMainLineMoves } from "../../utils/moveTreeUtils";
import { useStudyData } from "./hooks/useStudyData";
import { useStudyLikes } from "./hooks/useStudyLikes";
import { useReviewStudyLayout } from "./hooks/useReviewStudyLayout";
import { useAutoNavigateToFirstMove } from "./hooks/useAutoNavigateToFirstMove";

export const ReviewStudy = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Study data hook
  const { study, loading, error, setRetryCount, setError, studyGameState } =
    useStudyData(id);

  // Study likes hook
  const { isLiked, likesCount, isLiking, handleLike, handleUnlike } =
    useStudyLikes({ id, study });

  // Opening detection
  const { opening, detectOpening } = useOpeningDetection();

  // Review study layout hook
  const { layoutProps, chessGameReview } = useReviewStudyLayout({
    studyGameState,
    study,
    opening,
    onNavigationError: (message) => {
      toast({
        title: "Navigation Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Detect opening when moves change
  useEffect(() => {
    if (chessGameReview.gameState.moveTree) {
      const mainLineMoves = getMainLineMoves(
        chessGameReview.gameState.moveTree,
      );
      if (mainLineMoves.length > 0) {
        detectOpening(mainLineMoves);
      }
    }
  }, [chessGameReview.gameState.moveTree, detectOpening]);

  // Auto-navigate to first move
  useAutoNavigateToFirstMove({ study, chessGameReview });

  // Add like functionality to layout props
  const layoutPropsWithLikes = {
    ...layoutProps,
    studyId: study?._id,
    isLiked,
    likesCount,
    isLiking,
    onLike: handleLike,
    onUnlike: handleUnlike,
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner fullScreen size="large" text="Loading study..." />;
  }

  // Error state
  if (error || (!loading && !study)) {
    return (
      <ErrorHandler
        error={
          error || {
            type: "SERVER",
            message: "Study not found",
            statusCode: 404,
          }
        }
        onRetry={() => {
          setError(null);
          setRetryCount((prev) => prev + 1);
        }}
      />
    );
  }

  // Success state
  if (!study) {
    return null; // This should never happen due to the error check above
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden pt-16 sm:pt-20 md:pt-24">
      {/* Mobile Layout */}
      <div className="flex flex-1 lg:hidden">
        <MobileStudyLayout {...layoutPropsWithLikes} />
      </div>
      {/* Desktop Layout */}
      <div className="hidden flex-1 lg:flex">
        <DesktopStudyLayout {...layoutPropsWithLikes} />
      </div>
    </div>
  );
};
