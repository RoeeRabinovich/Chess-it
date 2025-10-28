import { useEffect, useCallback, useState, useRef } from "react";
import { Chess } from "chess.js";
import ChessBoard from "../../components/ChessBoard/ChessBoard";
import { MoveNotation } from "../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../components/ChessControls/ChessControls";
import { EngineAnalysis } from "../../components/EngineAnalysis/EngineAnalysis";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import Engine from "../../../../Client/public/stockfish/engine";

export const CreateStudy = () => {
  const [boardScale, setBoardScale] = useState(1.0);

  // Engine state
  const engineRef = useRef<Engine | null>(null);
  const [isEngineEnabled, setIsEngineEnabled] = useState(false);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);

  // Create a chess game ref for engine analysis
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // Store engine variables
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [depth, setDepth] = useState(0);
  const [bestLine, setBestLine] = useState("");
  const [possibleMate, setPossibleMate] = useState("");
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

  // Track current FEN for evaluation
  const currentFenRef = useRef(gameState.position);

  // Handle enabling the engine
  const handleEnableEngine = useCallback(() => {
    if (isEngineLoading || isEngineReady) return;

    setIsEngineLoading(true);
    setIsEngineEnabled(true);

    // Load engine in the next tick to allow UI update
    setTimeout(() => {
      try {
        const engine = new Engine();
        engineRef.current = engine;

        engine.onMessage(({ positionEvaluation, possibleMate, pv, depth }) => {
          // Ignore messages with a depth less than 10
          if (depth && depth < 10) return;

          // Get the current turn from the current FEN
          const isWhiteToMove = currentFenRef.current.includes(" w ");

          // Update the position evaluation
          if (positionEvaluation) {
            const evalValue =
              (isWhiteToMove ? 1 : -1) * (Number(positionEvaluation) / 100);
            setPositionEvaluation(evalValue);
          }

          // Update the possible mate, depth and best line
          if (possibleMate) setPossibleMate(possibleMate);
          if (depth) setDepth(depth);
          if (pv) setBestLine(pv);
        });

        setIsEngineReady(true);
        setIsEngineLoading(false);
      } catch (error) {
        console.error("Failed to load engine:", error);
        setIsEngineLoading(false);
      }
    }, 100);
  }, [isEngineLoading, isEngineReady]);

  // Sync the chess game ref with the game state
  useEffect(() => {
    try {
      chessGame.load(gameState.position);
      currentFenRef.current = gameState.position;
    } catch (error) {
      console.error("Failed to load position into engine:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.position]);

  // Analyze position when it changes (only if engine is enabled and ready)
  useEffect(() => {
    if (!isEngineEnabled || !isEngineReady || !engineRef.current) return;
    if (chessGame.isGameOver() || chessGame.isDraw()) return;

    // Defer analysis to not block UI
    const timeoutId = setTimeout(() => {
      engineRef.current?.stop();
      setDepth(0);
      setBestLine("");
      setPositionEvaluation(0);
      setPossibleMate("");

      const fen = chessGame.fen();
      engineRef.current?.evaluatePosition(fen, 15);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.position, isEngineEnabled, isEngineReady]);

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
              <div
                className="relative flex items-center justify-center"
                style={{
                  height: "600px",
                  width: "600px",
                  maxWidth: "100%",
                  margin: "0 auto",
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    scale: boardScale,
                    transformOrigin: "center center",
                  }}
                >
                  <ChessBoard
                    position={gameState.position}
                    onMove={makeMove}
                    isFlipped={gameState.isFlipped}
                    isInteractive={true}
                  />
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
                    className={`h-2 w-2 rounded-full ${isEngineReady ? "bg-green-500" : "bg-gray-400"}`}
                  ></div>
                  <h3 className="text-foreground text-lg font-semibold">
                    Engine Analysis
                  </h3>
                </div>
                {!isEngineEnabled && (
                  <button
                    onClick={handleEnableEngine}
                    disabled={isEngineLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isEngineLoading ? "Loading..." : "Enable Analysis"}
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
                    Click "Enable Analysis" to start engine evaluation
                  </p>
                </div>
              ) : isEngineLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-muted mb-4 h-12 w-12 animate-pulse rounded-full"></div>
                  <p className="text-muted-foreground text-sm">
                    Loading Stockfish engine...
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
