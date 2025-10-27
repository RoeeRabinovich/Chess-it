import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import ChessBoard from "../../components/ChessBoard/ChessBoard";
import { MoveNotation } from "../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../components/ChessControls/ChessControls";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { MoveData, EngineLine } from "../../types/chess";
// Import from public directory - it will be available at runtime
import Engine from "../../../../Client/public/stockfish/engine";

export const CreateStudy = () => {
  const [boardScale, setBoardScale] = useState(1.0);
  const [engineLines, setEngineLines] = useState<EngineLine[]>([]);

  // Initialize Stockfish engine (from example)
  const engine = useMemo(() => new Engine(), []);

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

  // Set up engine message handler once
  useEffect(() => {
    engine.onMessage(({ positionEvaluation, possibleMate, pv, depth }) => {
      // Ignore messages with a depth less than 10
      if (depth && depth < 10) {
        return;
      }

      // Get the current turn from the current FEN
      const isWhiteToMove = currentFenRef.current.includes(" w ");

      // Update the position evaluation
      if (positionEvaluation) {
        const evalValue =
          (isWhiteToMove ? 1 : -1) * (Number(positionEvaluation) / 100);
        setPositionEvaluation(evalValue);
      }

      // Update the possible mate, depth and best line
      if (possibleMate) {
        setPossibleMate(possibleMate);
      }
      if (depth) {
        setDepth(depth);
      }
      if (pv) {
        setBestLine(pv);

        // Update engine lines for the board arrows
        const bestMove = pv.split(" ")?.[0];
        if (bestMove) {
          setEngineLines([
            {
              moves: [bestMove],
              evaluation: positionEvaluation ? parseInt(positionEvaluation) : 0,
              depth: depth || 0,
            },
          ]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Find best move when position changes
  useEffect(() => {
    if (!chessGame.isGameOver() && !chessGame.isDraw()) {
      // Stop any running analysis before starting new one
      engine.stop();

      // Reset evaluation state
      setDepth(0);
      setBestLine("");
      setEngineLines([]);
      setPositionEvaluation(0);
      setPossibleMate("");

      // Small delay to ensure position is loaded and engine has stopped
      setTimeout(() => {
        const fen = chessGame.fen();
        console.log("Analyzing position:", fen);
        engine.evaluatePosition(fen, 18);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.position]);

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

  const handleMove = useCallback(
    (move: MoveData) => {
      return makeMove(move);
    },
    [makeMove],
  );

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
      {/* Header Section */}
      <div className="bg-pastel-mint text-primary dark:bg-secondary relative overflow-hidden">
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
                {depth > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground mb-1 text-sm">
                        Position Evaluation:
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          positionEvaluation > 0
                            ? "text-green-600"
                            : positionEvaluation < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {possibleMate
                          ? `#${possibleMate}`
                          : positionEvaluation.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 text-sm">
                        Depth:
                      </p>
                      <p className="text-foreground text-lg font-semibold">
                        {depth}
                      </p>
                    </div>
                    {bestLine && (
                      <div>
                        <p className="text-muted-foreground mb-1 text-sm">
                          Best Line:
                        </p>
                        <p className="text-foreground text-sm italic">
                          {bestLine.slice(0, 50)}
                          {bestLine.length > 50 ? "..." : ""}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">🤖</div>
                      <p className="text-muted-foreground">
                        Engine analysis will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chess Board Container */}
            <div
              className="bg-card flex items-center justify-center rounded-2xl p-6 shadow-xl"
              style={{
                minHeight: `${600 * boardScale}px`,
                minWidth: `${600 * boardScale}px`,
                maxWidth: "100%",
              }}
            >
              <div
                className="flex justify-center"
                style={{ scale: boardScale, transformOrigin: "center center" }}
              >
                <div>
                  <ChessBoard
                    position={gameState.position}
                    onMove={handleMove}
                    isFlipped={gameState.isFlipped}
                    engineLines={engineLines}
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
              boardScale={boardScale}
              onBoardScaleChange={setBoardScale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
