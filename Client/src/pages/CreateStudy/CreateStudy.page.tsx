import { useState, useEffect } from "react";
import ChessBoard from "../../components/ChessBoard/ChessBoard";
import { EngineLines } from "../../components/EngineLines/EngineLines";
import { MoveNotation } from "../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../components/ChessControls/ChessControls";
import { useChessGame } from "../../hooks/useChessGame";
import { useStockfish } from "../../hooks/useStockfish";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { StockfishConfig, MoveData } from "../../types/chess";

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

  const [stockfishConfig, setStockfishConfig] = useState<StockfishConfig>({
    depth: 15,
    autoDepth: false,
    multiPv: 3,
  });

  const { analysis, analyzePosition } = useStockfish(stockfishConfig);
  const { opening, detectOpening } = useOpeningDetection();

  // Analyze position when it changes
  useEffect(() => {
    if (gameState.position) {
      analyzePosition(gameState.position);
    }
  }, [gameState.position, analyzePosition]);

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

  const handleEngineMoveClick = (moves: string[]) => {
    // For now, just show the moves in console
    // In a full implementation, this would preview the moves on the board
    console.log("Engine suggested moves:", moves);
  };

  const handleDepthChange = (depth: number) => {
    setStockfishConfig((prev) => ({ ...prev, depth }));
  };

  const handleAutoDepthToggle = () => {
    setStockfishConfig((prev) => ({
      ...prev,
      autoDepth: !prev.autoDepth,
      depth: prev.autoDepth ? 15 : prev.depth,
    }));
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
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Create Study
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze positions with Stockfish engine and explore chess openings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Board and Engine */}
          <div className="lg:col-span-2">
            <EngineLines
              lines={analysis.lines}
              isAnalyzing={analysis.isAnalyzing}
              onMoveClick={handleEngineMoveClick}
            />

            <ChessBoard
              position={gameState.position}
              onMove={handleMove}
              isFlipped={gameState.isFlipped}
              engineLines={analysis.lines}
              isInteractive={true}
            />
          </div>

          {/* Right Column - Notation */}
          <div className="lg:col-span-1">
            <MoveNotation
              moves={gameState.moves}
              currentMoveIndex={gameState.currentMoveIndex}
              onMoveClick={handleMoveClick}
              opening={opening || undefined}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="mt-8">
          <ChessControls
            onFlipBoard={flipBoard}
            onReset={resetGame}
            onUndo={undoMove}
            onRedo={redoMove}
            onLoadFEN={handleLoadFEN}
            onLoadPGN={handleLoadPGN}
            canUndo={canUndo}
            canRedo={canRedo}
            engineDepth={stockfishConfig.depth}
            onDepthChange={handleDepthChange}
            autoDepth={stockfishConfig.autoDepth}
            onAutoDepthToggle={handleAutoDepthToggle}
          />
        </div>
      </div>
    </div>
  );
};
