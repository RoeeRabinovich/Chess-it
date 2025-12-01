import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../../services/api";
import { Study } from "../../types/study";
import { ApiError } from "../../types/auth";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorHandler } from "../../components/ErrorHandler/ErrorHandler";
import { useChessGameReview } from "../../hooks/useChessGameReview/useChessGameReview";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { MobileStudyLayout } from "../CreateStudy/layouts/MobileStudyLayout";
import { DesktopStudyLayout } from "../CreateStudy/layouts/DesktopStudyLayout";
import { ChessMove, MovePath } from "../../types/chess";
import { getMainLineMoves } from "../../utils/moveTreeUtils";

export const ReviewStudy = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Study data state
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Memoize studyGameState to prevent unnecessary re-renders
  const studyGameState = useMemo(() => {
    if (!study?.gameState) {
      return {
        position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moveTree: [],
        currentPath: [],
        isFlipped: false,
      };
    }
    // Ensure the gameState matches the expected structure
    const { position, moveTree, currentPath, isFlipped, opening, comments } =
      study.gameState;
    return {
      position,
      moveTree: moveTree || [],
      currentPath: currentPath || [],
      isFlipped: isFlipped || false,
      opening,
      comments,
    };
  }, [study?.gameState]);

  // Chess game state for review (only initialized when study is loaded)
  // Don't initialize until we have study data to avoid errors
  const chessGameReview = useChessGameReview({
    studyGameState,
    onNavigationError: (message) => {
      toast({
        title: "Navigation Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Opening detection
  const { opening, detectOpening } = useOpeningDetection();

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

  // Handler for layout - uses MovePath for tree structure
  const handleMoveClick = useCallback(
    (path: MovePath) => {
      chessGameReview.navigateToBranchMove(path);
    },
    [chessGameReview],
  );

  const handleSaveComment = useCallback(() => {
    // Comments are read-only in review mode - do nothing
  }, []);

  // Check if study is liked and fetch likes count
  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!id || !apiService.isAuthenticated() || !study) return;

      try {
        const likedIds = await apiService.getLikedStudyIds();
        setIsLiked(likedIds.includes(id));
      } catch (err) {
        // Silently fail - user might not be authenticated
        console.error("Failed to check liked status:", err);
      }
    };

    if (study) {
      setLikesCount(study.likes || 0);
      checkLikedStatus();
    }
  }, [id, study]);

  // Handle like/unlike
  const handleLike = useCallback(async () => {
    if (!id || !apiService.isAuthenticated() || isLiking) return;

    setIsLiking(true);
    try {
      await apiService.likeStudy(id);
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      toast({
        title: "Study liked",
        description: "This study has been added to your archive.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError?.message || "Failed to like study. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  }, [id, isLiking, toast]);

  const handleUnlike = useCallback(async () => {
    if (!id || !apiService.isAuthenticated() || isLiking) return;

    setIsLiking(true);
    try {
      await apiService.unlikeStudy(id);
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      toast({
        title: "Study unliked",
        description: "This study has been removed from your archive.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError?.message || "Failed to unlike study. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  }, [id, isLiking, toast]);

  // Get current move comment reactively (updates when navigating between moves)
  const currentMoveComment = useMemo(() => {
    return chessGameReview.getComment() || "";
  }, [chessGameReview]);

  // Prepare layout props for review mode
  const layoutProps = useMemo(
    () => ({
      gameState: chessGameReview.gameState,
      makeMove: (move: ChessMove) => chessGameReview.makeMove(move),
      onMoveClick: handleMoveClick,
      currentPath: chessGameReview.currentPath,
      // Engine disabled in review mode
      isEngineEnabled: false,
      isAnalyzing: false,
      formattedEngineLines: [],
      displayEvaluation: { evaluation: 0, possibleMate: null },
      // Controls
      onFlipBoard: chessGameReview.flipBoard,
      onUndo: chessGameReview.undoMove,
      onReset: chessGameReview.resetGame,
      onLoadFEN: () => false, // Disabled
      onLoadPGN: () => false, // Disabled
      canUndo: chessGameReview.canUndo,
      canGoToPreviousMove: chessGameReview.canGoToPreviousMove,
      canGoToNextMove: chessGameReview.canGoToNextMove,
      onPreviousMove: chessGameReview.goToPreviousMove,
      onNextMove: chessGameReview.goToNextMove,
      // Engine settings disabled
      isEngineEnabledForSettings: false,
      onEngineToggle: () => {}, // No-op
      engineLinesCount: 3,
      onEngineLinesCountChange: () => {}, // No-op
      engineDepth: 12,
      onEngineDepthChange: () => {}, // No-op
      analysisMode: "quick" as const,
      onAnalysisModeChange: () => {}, // No-op (engine disabled in review mode)
      boardScale: 1.0,
      onBoardScaleChange: () => {}, // Optional: could allow board scaling
      // Other
      opening: opening || study?.gameState?.opening,
      currentMoveComment,
      onSaveComment: handleSaveComment,
      readOnlyComments: true, // Comments are read-only in review mode
      // Create Study button hidden
      onCreateStudy: undefined,
      // Study metadata (replaces engine lines in review mode)
      studyName: study?.studyName,
      studyCategory: study?.category,
      studyDescription: study?.description,
      // Like functionality
      studyId: study?._id,
      isLiked,
      likesCount,
      isLiking,
      onLike: handleLike,
      onUnlike: handleUnlike,
    }),
    [
      chessGameReview,
      handleMoveClick,
      handleSaveComment,
      opening,
      study?.gameState?.opening,
      currentMoveComment,
      study?.studyName,
      study?.category,
      study?.description,
      study?._id,
      isLiked,
      likesCount,
      isLiking,
      handleLike,
      handleUnlike,
    ],
  );

  // Load study data
  useEffect(() => {
    const fetchStudy = async () => {
      if (!id) {
        setError({
          type: "VALIDATION",
          message: "Study ID is missing",
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const studyData = await apiService.getStudyById(id);
        setStudy(studyData);
        setError(null);
        // Game state initialization will be handled in Step 4
      } catch (err) {
        const apiError = err as ApiError;

        // Enhance error message for study-specific context
        const enhancedError: ApiError = { ...apiError };

        if (apiError.statusCode === 404) {
          enhancedError.message = "Study not found.";
        } else if (apiError.statusCode === 403) {
          enhancedError.message = "Access denied. This study is private.";
        } else if (apiError.statusCode === 401) {
          enhancedError.message = "Authentication required to view this study.";
        } else if (apiError.type === "NETWORK") {
          enhancedError.message =
            "Network error. Please check your connection.";
        } else if (!apiError.message) {
          enhancedError.message = "Failed to load study. Please try again.";
        }

        setError(enhancedError);
        toast({
          title: "Error",
          description: enhancedError.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [id, toast, retryCount]);

  // Auto-navigate to first move when study loads
  const hasNavigatedRef = useRef(false);
  useEffect(() => {
    // Reset navigation flag when study changes
    if (study) {
      hasNavigatedRef.current = false;
    }
  }, [study?._id]);

  useEffect(() => {
    if (
      study &&
      !hasNavigatedRef.current &&
      chessGameReview.gameState.moveTree &&
      chessGameReview.gameState.moveTree.length > 0 &&
      chessGameReview.gameState.currentPath.length === 0
    ) {
      // Study has moves but is at starting position - navigate to first move of main line
      chessGameReview.navigateToMove(0);
      hasNavigatedRef.current = true;
    }
  }, [
    study,
    chessGameReview.gameState.moveTree,
    chessGameReview.gameState.currentPath,
    chessGameReview,
  ]);

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
        <MobileStudyLayout {...layoutProps} />
      </div>
      {/* Desktop Layout */}
      <div className="hidden flex-1 lg:flex">
        <DesktopStudyLayout {...layoutProps} />
      </div>
    </div>
  );
};
