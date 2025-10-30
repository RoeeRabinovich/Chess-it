import { useEffect, useCallback, useState, lazy, Suspense } from "react";
import { MoveNotation } from "../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../components/ChessControls/ChessControls";
import { EngineAnalysis } from "../../components/EngineAnalysis/EngineAnalysis";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { useStockfish } from "../../hooks/useStockfish";

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
    enableEngine,
  } = useStockfish(gameState.position, undefined, 12, 100);

  const { opening, detectOpening } = useOpeningDetection();

  // Detect opening when moves change
  useEffect(() => {
    detectOpening(gameState.moves);
  }, [gameState.moves, detectOpening]);

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
    <div className="py-10">
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Left Column - Board */}
          <div className="xl:col-span-2">
            {/* Chess Board Container with fixed dimensions */}
            <div className="bg-card overflow-hidden rounded-2xl p-6 shadow-xl">
              <div className="relative mx-auto flex h-[600px] w-[600px] max-w-full items-center justify-center">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    scale: boardScale,
                    transformOrigin: "center center",
                  }}
                >
                  <Suspense
                    fallback={
                      <div className="flex h-full w-full items-center justify-center">
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
          </div>

          {/* Right Column - Analysis and Move Notation */}
          <div className="space-y-6 xl:col-span-1">
            {/* Engine Analysis Panel */}
            <div className="bg-card rounded-2xl p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${isEngineEnabled ? (isAnalyzing ? "animate-pulse bg-yellow-500" : "bg-green-500") : "bg-gray-400"}`}
                  ></div>
                  <h3 className="text-foreground text-lg font-semibold">
                    Engine Analysis
                  </h3>
                  {/* {isAnalyzing && (
                    <span className="text-muted-foreground text-xs">
                      Analyzing...
                    </span>
                  )} */}
                </div>
                {!isEngineEnabled && (
                  <button
                    onClick={() => enableEngine()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Enable Analysis
                  </button>
                )}
              </div>

              {!isEngineEnabled ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="mb-4 h-16 w-16 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">
                    Click "Enable Analysis" to start server-side engine
                    evaluation
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Powered by Stockfish 17.1
                  </p>
                </div>
              ) : (
                <EngineAnalysis
                  positionEvaluation={positionEvaluation}
                  depth={depth}
                  bestLine={bestLine}
                  possibleMate={possibleMate}
                />
              )}
            </div>

            {/* Move Notation */}
            <div className="bg-card rounded-2xl p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <h3 className="text-foreground text-lg font-semibold">
                  Move History
                </h3>
              </div>
              <MoveNotation
                moves={gameState.moves}
                currentMoveIndex={gameState.currentMoveIndex}
                onMoveClick={handleMoveClick}
                opening={opening || undefined}
              />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="mt-8">
          <div className="bg-card rounded-2xl p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <h3 className="text-foreground text-lg font-semibold">
                Game Controls
              </h3>
            </div>
            <ChessControls
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
