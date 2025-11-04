import {
  useEffect,
  useCallback,
  useState,
  lazy,
  Suspense,
  useMemo,
  useRef,
} from "react";
import { ToolsSidebar } from "../../components/ToolsSidebar/ToolsSidebar";
import { EvaluationBar } from "../../components/EvaluationBar/EvaluationBar";
import { EngineLines } from "../../components/EngineLines/EngineLines";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { useStockfish } from "../../hooks/useStockfish";
import { convertUCIToSAN } from "../../utils/chessNotation";

// Lazy load the heavy ChessBoard component
const ChessBoard = lazy(() => import("../../components/ChessBoard/ChessBoard"));

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

  return (
    <div className="bg-background flex h-screen overflow-hidden pt-16 sm:pt-20 md:pt-24">
      {/* Main Content Container */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Column - Evaluation Bar + Board */}
        <div className="bg-muted/30 relative flex min-h-0 flex-1 flex-col items-center justify-center p-3 sm:p-4 lg:max-h-screen lg:max-w-[calc(100%-400px)] lg:flex-row lg:p-6">
          {/* Mobile: Engine Lines Section */}
          <div className="mb-2 w-full lg:hidden">
            {gameState.moves.length > 0 && (
              <EngineLines
                lines={formattedEngineLines.map((line) => ({
                  moves: line.sanNotation.split(" "),
                  evaluation: line.evaluation,
                  depth: line.depth,
                  mate: line.possibleMate
                    ? parseInt(line.possibleMate)
                    : undefined,
                }))}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
          {/* Mobile: Horizontal evaluation bar on top */}
          {isEngineEnabled && (
            <div className="mb-2 flex w-full justify-center sm:mb-3 lg:hidden">
              <div
                className="relative z-10 flex-shrink-0"
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  height: "24px",
                  transform: `scale(${boardScale})`,
                  transformOrigin: "center center",
                }}
              >
                <EvaluationBar
                  evaluation={displayEvaluation.evaluation}
                  possibleMate={displayEvaluation.possibleMate}
                  isFlipped={gameState.isFlipped}
                  height={24}
                  width="100%"
                />
              </div>
            </div>
          )}
          {/* Desktop: Vertical evaluation bar on left */}
          {isEngineEnabled && (
            <div className="hidden lg:block">
              <div
                className="relative z-10 flex-shrink-0"
                style={{
                  width: "32px",
                  height: "550px",
                  marginRight: "4px",
                  transform: `scale(${boardScale})`,
                  transformOrigin: "center center",
                }}
              >
                <EvaluationBar
                  evaluation={displayEvaluation.evaluation}
                  possibleMate={displayEvaluation.possibleMate}
                  isFlipped={gameState.isFlipped}
                  height={550}
                />
              </div>
            </div>
          )}
          <div className="relative flex w-full flex-1 items-center justify-center py-2 sm:py-4">
            {/* Board */}
            <div
              className="relative z-0 flex-shrink-0 transition-transform duration-200"
              style={{
                transform: `scale(${boardScale})`,
                transformOrigin: "center center",
              }}
            >
              <Suspense
                fallback={
                  <div className="flex h-[300px] w-[300px] items-center justify-center sm:h-[400px] sm:w-[400px] md:h-[500px] md:w-[500px] lg:h-[550px] lg:w-[550px]">
                    <div className="bg-muted border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
                  </div>
                }
              >
                <ChessBoard
                  position={gameState.position}
                  onMove={makeMove}
                  isFlipped={gameState.isFlipped}
                  isInteractive={true}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Right Column - Tools Sidebar */}
        <div className="border-border bg-background w-full border-l lg:w-[400px] lg:max-w-[400px] lg:min-w-[400px]">
          <div className="flex h-full flex-col overflow-hidden">
            <ToolsSidebar
              isEngineEnabled={isEngineEnabled}
              isAnalyzing={isAnalyzing}
              engineLines={engineLines}
              formattedEngineLines={formattedEngineLines}
              moves={gameState.moves}
              branches={gameState.branches || []}
              currentMoveIndex={gameState.currentMoveIndex}
              onMoveClick={handleMoveClick}
              onBranchMoveClick={handleBranchMoveClick}
              opening={opening || undefined}
              onFlipBoard={flipBoard}
              onUndo={undoMove}
              onRedo={redoMove}
              onLoadFEN={handleLoadFEN}
              onLoadPGN={handleLoadPGN}
              canUndo={canUndo}
              canRedo={canRedo}
              canGoToPreviousMove={canGoToPreviousMove}
              canGoToNextMove={canGoToNextMove}
              onPreviousMove={goToPreviousMove}
              onNextMove={goToNextMove}
              isEngineEnabledForSettings={engineEnabled}
              onEngineToggle={handleEngineToggle}
              engineLinesCount={engineLinesCount}
              onEngineLinesCountChange={setEngineLinesCount}
              engineDepth={engineDepth}
              onEngineDepthChange={setEngineDepth}
              boardScale={boardScale}
              onBoardScaleChange={setBoardScale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
