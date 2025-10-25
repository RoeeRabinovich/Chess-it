import { useEffect } from "react";
import ChessBoard from "../../components/ChessBoard/ChessBoard";
import { MoveNotation } from "../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../components/ChessControls/ChessControls";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { MoveData } from "../../types/chess";

export const CreateStudy = () => {
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

  const { opening, detectOpening } = useOpeningDetection();

  // Debug game state
  useEffect(() => {
    console.log("CreateStudy: Game state changed:", {
      moves: gameState.moves,
      currentMoveIndex: gameState.currentMoveIndex,
      position: gameState.position,
    });
  }, [gameState]);

  // Detect opening when moves change
  useEffect(() => {
    detectOpening(gameState.moves);
  }, [gameState.moves, detectOpening]);

  const handleMove = (move: MoveData) => {
    return makeMove(move);
  };

  const handleMoveClick = (moveIndex: number) => {
    navigateToMove(moveIndex);
  };

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
      {/* Header Section */}
      <div className="bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-foreground mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Create Study
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
              Analyze positions, explore variations, and master chess with our
              interactive study tools
            </p>
            {opening && (
              <div className="bg-foreground/10 mt-6 inline-flex items-center rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="text-foreground text-sm font-medium">
                  Opening: {opening?.name} - {opening?.eco}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          {/* Left Column - Board and Analysis */}
          <div className="xl:col-span-3">
            {/* Engine Analysis Panel */}
            <div className="bg-card mb-6 rounded-2xl p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <h3 className="text-foreground text-xl font-semibold">
                  Engine Analysis
                </h3>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <div className="flex h-32 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">🤖</div>
                    <p className="text-muted-foreground">
                      Engine analysis will be available here
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chess Board Container */}
            <div className="bg-card rounded-2xl p-6 shadow-xl">
              <div className="flex justify-center">
                <div className="rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 p-4 shadow-inner dark:from-amber-900 dark:to-amber-800">
                  <ChessBoard
                    position={gameState.position}
                    onMove={handleMove}
                    isFlipped={gameState.isFlipped}
                    engineLines={[]}
                    isInteractive={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Move Notation */}
          <div className="xl:col-span-1">
            <div className="sticky top-20">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};
