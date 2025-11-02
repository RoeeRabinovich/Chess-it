import { useEffect, useCallback, useState, lazy, Suspense, useMemo } from "react";
import { ToolsSidebar } from "../../components/ToolsSidebar/ToolsSidebar";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { useStockfish } from "../../hooks/useStockfish";
import { convertUCIToSAN } from "../../utils/chessNotation";

// Lazy load the heavy ChessBoard component
const ChessBoard = lazy(() => import("../../components/ChessBoard/ChessBoard"));

export const CreateStudy = () => {
  const [boardScale, setBoardScale] = useState(1.0);

  // Engine state
  const {
    gameState,
    makeMove,
    undoMove,
    redoMove,
    resetGame,
    flipBoard,
    loadFEN,
    loadPGN,
    navigateToMove,
    canUndo,
    canRedo,
  } = useChessGame();
  const {
    isEngineEnabled,
    isAnalyzing,
    positionEvaluation,
    depth,
    bestLine,
    possibleMate,
    engineLines,
    enableEngine,
  } = useStockfish(
    gameState.position,
    gameState.moves.length,
    12,
    400,
  );

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Main Content Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Board */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/30 p-6">
          <div className="relative flex items-center justify-center">
            <div
              className="flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${boardScale})`,
                transformOrigin: "center center",
              }}
            >
              <Suspense
                fallback={
                  <div className="flex h-[600px] w-[600px] items-center justify-center">
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
        <div className="w-[400px] min-w-[400px] border-l border-border bg-background">
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
              opening={opening || undefined}
              onFlipBoard={flipBoard}
              onReset={resetGame}
              onUndo={undoMove}
              onRedo={redoMove}
              onLoadFEN={handleLoadFEN}
              onLoadPGN={handleLoadPGN}
              canUndo={canUndo}
              canRedo={canRedo}
              boardScale={boardScale}
              onBoardScaleChange={setBoardScale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
