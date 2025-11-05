import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { MobileStudyLayout } from "./layouts/MobileStudyLayout";
import { DesktopStudyLayout } from "./layouts/DesktopStudyLayout";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { useStockfish } from "../../hooks/useStockfish";
import { convertUCIToSAN } from "../../utils/chessNotation";

export const CreateStudy = () => {
  // Engine settings state
  const [engineEnabled, setEngineEnabled] = useState(true);
  const [engineLinesCount, setEngineLinesCount] = useState(3);
  const [engineDepth, setEngineDepth] = useState(12);
  const [boardScale, setBoardScale] = useState(1.0);

  // Game state
  const {
    gameState,
    makeMove,
    undoMove,
    redoMove,
    flipBoard,
    loadFEN,
    loadPGN,
    navigateToMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
    canUndo,
    canRedo,
    canGoToPreviousMove,
    canGoToNextMove,
  } = useChessGame();

  // Engine analysis - use configurable settings
  const {
    isEngineEnabled,
    isAnalyzing,
    engineLines,
    positionEvaluation,
    depth,
    possibleMate,
  } = useStockfish(
    gameState.position,
    gameState.moves.length,
    engineDepth,
    400,
    engineLinesCount,
    engineEnabled,
  );

  // Keep stable evaluation values to prevent flickering during analysis
  // Track both the position FEN and the evaluation to ensure we show correct data
  const stableEvalRef = useRef<{
    position: string;
    evaluation: number;
    possibleMate: string | null;
  }>({
    position: "",
    evaluation: 0,
    possibleMate: null,
  });

  // Update stable values when new analysis data arrives for the current position
  useEffect(() => {
    if (depth > 0 && isEngineEnabled) {
      stableEvalRef.current = {
        position: gameState.position,
        evaluation: positionEvaluation,
        possibleMate: possibleMate || null,
      };
    }
  }, [
    depth,
    positionEvaluation,
    possibleMate,
    isEngineEnabled,
    gameState.position,
  ]);

  // Get the evaluation to display - use current if available, otherwise stable only if it matches current position
  const displayEvaluation = useMemo(() => {
    // If we have current analysis data (depth > 0), always use it
    if (depth > 0 && isEngineEnabled) {
      return {
        evaluation: positionEvaluation,
        possibleMate: possibleMate || null,
      };
    }
    // If no current data, only use stable values if they match the current position
    // This prevents showing evaluation from a previous position
    if (
      stableEvalRef.current.position === gameState.position &&
      stableEvalRef.current.evaluation !== 0
    ) {
      return {
        evaluation: stableEvalRef.current.evaluation,
        possibleMate: stableEvalRef.current.possibleMate,
      };
    }
    // Default to neutral if no valid data
    return {
      evaluation: 0,
      possibleMate: null,
    };
  }, [
    depth,
    positionEvaluation,
    possibleMate,
    isEngineEnabled,
    gameState.position,
  ]);

  const { opening, detectOpening } = useOpeningDetection();

  // Detect opening when moves change
  useEffect(() => {
    detectOpening(gameState.moves);
  }, [gameState.moves, detectOpening]);

  // Format engine lines to SAN notation
  const formattedEngineLines = useMemo(() => {
    return engineLines.map((line) => ({
      sanNotation: convertUCIToSAN(line.moves, gameState.position),
      evaluation: line.evaluation,
      depth: line.depth,
      possibleMate: line.possibleMate,
    }));
  }, [engineLines, gameState.position]);

  const handleMoveClick = useCallback(
    (moveIndex: number) => {
      navigateToMove(moveIndex);
    },
    [navigateToMove],
  );

  const handleBranchMoveClick = useCallback(
    (branchId: string, moveIndexInBranch: number) => {
      navigateToBranchMove(branchId, moveIndexInBranch);
    },
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

  // Prepare shared props for layout components
  const layoutProps = {
    gameState,
    makeMove,
    onMoveClick: handleMoveClick,
    onBranchMoveClick: handleBranchMoveClick,
    isEngineEnabled,
    isAnalyzing,
    formattedEngineLines,
    displayEvaluation,
    onFlipBoard: flipBoard,
    onUndo: undoMove,
    onRedo: redoMove,
    onLoadFEN: handleLoadFEN,
    onLoadPGN: handleLoadPGN,
    canUndo,
    canRedo,
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
    boardScale,
    onBoardScaleChange: setBoardScale,
    opening: opening || undefined,
  };

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
