import { useEffect, useCallback, useState, useMemo } from "react";
import { MobileStudyLayout } from "./layouts/MobileStudyLayout";
import { DesktopStudyLayout } from "./layouts/DesktopStudyLayout";
import { CreateStudyModal } from "./components/CreateStudyModal";
import { useChessGame } from "../../hooks/useChessGame/useChessGame.export";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { useStockfish } from "../../hooks/useStockfish";
import { getMainLineMoves } from "../../utils/moveTreeUtils";
import { useEvaluationDisplay } from "./hooks/useEvaluationDisplay";
import { useFormattedEngineLines } from "./hooks/useFormattedEngineLines";

export const CreateStudy = () => {
  // Engine settings state - lazy load: start with engine disabled
  const [engineEnabled, setEngineEnabled] = useState(false);
  const [engineLinesCount, setEngineLinesCount] = useState(3);
  const [engineDepth, setEngineDepth] = useState(12);
  const [analysisMode, setAnalysisMode] = useState<"quick" | "deep">("quick");
  const [boardScale, setBoardScale] = useState(1.0);

  // Create Study Modal state
  const [isCreateStudyModalOpen, setIsCreateStudyModalOpen] = useState(false);

  // Game state
  const {
    gameState,
    makeMove,
    undoMove,
    resetGame,
    flipBoard,
    loadFEN,
    loadPGN,

    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
    canUndo,
    canGoToPreviousMove,
    canGoToNextMove,
    addComment,
    getComment,
    currentPath,
  } = useChessGame();

  // Engine analysis - use configurable settings
  const mainLineMoves = useMemo(() => {
    return getMainLineMoves(gameState.moveTree);
  }, [gameState.moveTree]);

  const {
    isEngineEnabled,
    isAnalyzing,
    engineLines,
    positionEvaluation,
    depth,
    possibleMate,
    evaluationPosition,
  } = useStockfish(
    gameState.position,
    mainLineMoves.length,
    engineDepth,
    400,
    engineLinesCount,
    engineEnabled,
    analysisMode,
  );

  const displayEvaluation = useEvaluationDisplay({
    gameState,
    isEngineEnabled,
    depth,
    positionEvaluation,
    possibleMate,
    evaluationPosition,
  });

  const { opening, detectOpening } = useOpeningDetection();

  // Detect opening when moves change
  useEffect(() => {
    if (mainLineMoves.length > 0) {
      detectOpening(mainLineMoves);
    }
  }, [mainLineMoves, detectOpening]);

  // Lazy load: Auto-enable engine when user makes their first move
  useEffect(() => {
    if (mainLineMoves.length > 0 && !engineEnabled) {
      setEngineEnabled(true);
    }
  }, [mainLineMoves.length, engineEnabled]);

  const formattedEngineLines = useFormattedEngineLines({
    engineLines,
    position: gameState.position,
  });

  const handleMoveClick = useCallback(
    (path: number[]) => navigateToBranchMove(path),
    [navigateToBranchMove],
  );

  const handleLoadFEN = () => {
    const fen = prompt("Enter FEN position:");
    if (fen) {
      loadFEN(fen);
    }
  };

  const handleLoadPGN = () => {
    const pgn = prompt("Enter PGN moves:");
    if (pgn) {
      loadPGN(pgn);
    }
  };

  const handleEngineToggle = (enabled: boolean) => {
    setEngineEnabled(enabled);
  };

  const currentMoveComment = useMemo(() => getComment(), [getComment]);
  const handleSaveComment = useCallback(
    (comment: string) => addComment(comment),
    [addComment],
  );
  const handleCreateStudy = useCallback(
    () => setIsCreateStudyModalOpen(true),
    [],
  );

  // Prepare shared props for layout components
  const layoutProps = {
    gameState,
    makeMove,
    onMoveClick: handleMoveClick,
    currentPath,
    isEngineEnabled,
    isAnalyzing,
    formattedEngineLines,
    displayEvaluation,
    onFlipBoard: flipBoard,
    onUndo: undoMove,
    onReset: resetGame,
    onLoadFEN: handleLoadFEN,
    onLoadPGN: handleLoadPGN,
    canUndo,
    canGoToPreviousMove,
    canGoToNextMove,
    onPreviousMove: goToPreviousMove,
    onNextMove: goToNextMove,
    isEngineEnabledForSettings: engineEnabled,
    onEngineToggle: handleEngineToggle,
    engineLinesCount,
    onEngineLinesCountChange: setEngineLinesCount,
    engineDepth,
    onEngineDepthChange: setEngineDepth,
    analysisMode,
    onAnalysisModeChange: setAnalysisMode,
    boardScale,
    onBoardScaleChange: setBoardScale,
    opening: opening || undefined,
    currentMoveComment,
    onSaveComment: handleSaveComment,
    onCreateStudy: handleCreateStudy,
  };

  return (
    <>
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

      {/* Create Study Modal */}
      <CreateStudyModal
        isOpen={isCreateStudyModalOpen}
        onClose={() => setIsCreateStudyModalOpen(false)}
        gameState={gameState}
      />
    </>
  );
};
