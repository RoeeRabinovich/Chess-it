import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../../services/api";
import { Study } from "../../types/study";
import { ApiError } from "../../types/auth";
import { useToast } from "../../hooks/useToast";
import { ErrorHandler } from "../../components/ErrorHandler/ErrorHandler";
import { useChessGameReview } from "../../hooks/useChessGameReview";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { MobileStudyLayout } from "../CreateStudy/layouts/MobileStudyLayout";
import { DesktopStudyLayout } from "../CreateStudy/layouts/DesktopStudyLayout";
import { ChessMove } from "../../types/chess";

export const ReviewStudy = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Study data state
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize studyGameState to prevent unnecessary re-renders
  const studyGameState = useMemo(() => {
    if (!study?.gameState) {
      return {
        position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: [],
        branches: [],
        currentMoveIndex: -1,
        isFlipped: false,
      };
    }
    return study.gameState;
  }, [study?.gameState]);

  // Chess game state for review (only initialized when study is loaded)
  // Don't initialize until we have study data to avoid errors
  const chessGameReview = useChessGameReview({
    studyGameState,
    onInvalidMove: (message) => {
      toast({
        title: "Invalid Move",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Opening detection
  const { opening, detectOpening } = useOpeningDetection();

  // Detect opening when moves change
  useEffect(() => {
    if (study?.gameState?.moves) {
      detectOpening(study.gameState.moves);
    }
  }, [study?.gameState?.moves, detectOpening]);

  // Handlers for layout
  const handleMoveClick = useCallback(
    (moveIndex: number) => chessGameReview.navigateToMove(moveIndex),
    [chessGameReview],
  );

  const handleBranchMoveClick = useCallback(
    (branchId: string, moveIndexInBranch: number) =>
      chessGameReview.navigateToBranchMove(branchId, moveIndexInBranch),
    [chessGameReview],
  );

  const handleSaveComment = useCallback(() => {
    // Comments are read-only in review mode - do nothing
  }, []);

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
      onBranchMoveClick: handleBranchMoveClick,
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
    }),
    [
      chessGameReview,
      handleMoveClick,
      handleBranchMoveClick,
      handleSaveComment,
      opening,
      study?.gameState?.opening,
      currentMoveComment,
      study?.studyName,
      study?.category,
      study?.description,
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

  // Loading state
  if (loading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="text-center">
          <div className="bg-muted border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-lg">Loading study...</p>
        </div>
      </div>
    );
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
