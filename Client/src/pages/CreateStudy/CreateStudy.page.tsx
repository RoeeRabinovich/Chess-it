import {
  useEffect,
  useCallback,
  useState,
  useRef,
  lazy,
  Suspense,
} from "react";
import { Chess } from "chess.js";
import { MoveNotation } from "../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../components/ChessControls/ChessControls";
import { EngineAnalysis } from "../../components/EngineAnalysis/EngineAnalysis";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { analyzePosition } from "../../services/stockfishService";

// Lazy load the heavy ChessBoard component
const ChessBoard = lazy(() => import("../../components/ChessBoard/ChessBoard"));

export const CreateStudy = () => {
  const [boardScale, setBoardScale] = useState(1.0);

  // Engine state
  const [isEngineEnabled, setIsEngineEnabled] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisAbortController = useRef<AbortController | null>(null);

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
    if (isEngineEnabled) return;
    setIsEngineEnabled(true);
  }, [isEngineEnabled]);

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

  // Analyze position when it changes (only if engine is enabled)
  useEffect(() => {
    if (!isEngineEnabled) return;
    if (chessGame.isGameOver() || chessGame.isDraw()) return;

    // Abort previous analysis if still running
    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
    }

    // Defer analysis to not block UI and allow debouncing
    const timeoutId = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        setDepth(0);
        setBestLine("");
        setPositionEvaluation(0);
        setPossibleMate("");

        const fen = chessGame.fen();

        // Call the server API for analysis
        const result = await analyzePosition(fen, 15, 1);

        // Update the UI with results
        setPositionEvaluation(result.evaluation);
        setDepth(result.depth);
        setBestLine(result.bestLine);
        setPossibleMate(result.possibleMate || "");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Analysis failed:", error);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(timeoutId);
      if (analysisAbortController.current) {
        analysisAbortController.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.position, isEngineEnabled]);

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
                  {isAnalyzing && (
                    <span className="text-muted-foreground text-xs">
                      Analyzing...
                    </span>
                  )}
                </div>
                {!isEngineEnabled && (
                  <button
                    onClick={handleEnableEngine}
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
