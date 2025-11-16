import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { Chess } from "chess.js";
import { MobileStudyLayout } from "./layouts/MobileStudyLayout";
import { DesktopStudyLayout } from "./layouts/DesktopStudyLayout";
import { CreateStudyModal } from "./components/CreateStudyModal";
import { useChessGame } from "../../hooks/useChessGame";
import { useOpeningDetection } from "../../hooks/useOpeningDetection";
import { useStockfish } from "../../hooks/useStockfish";
import { convertUCIToSAN } from "../../utils/chessNotation";

export const CreateStudy = () => {
  // Engine settings state
  const [engineEnabled, setEngineEnabled] = useState(true);
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
    navigateToMove,
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
    canUndo,
    canGoToPreviousMove,
    canGoToNextMove,
    addComment,
    getComment,
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
    analysisMode,
  );

  // Store the current position's evaluation (already normalized) to keep it stable during analysis
  // Key: position FEN, Value: normalized evaluation
  const positionEvalCache = useRef<Map<string, { evaluation: number; possibleMate: string | null }>>(new Map());

  const displayEvaluation = useMemo(() => {
    // Determine whose turn it is to negate evaluation if needed
    const chess = new Chess();
    try {
      chess.load(gameState.position);
    } catch {
      // Invalid position, return cached eval for this position if available
      const cached = positionEvalCache.current.get(gameState.position);
      return cached || { evaluation: 0, possibleMate: null };
    }
    const isBlackToMove = chess.turn() === "b";

    // Stockfish evaluates from White's perspective
    // When it's Black's turn, negate the evaluation to show it from Black's perspective
    const normalizeEval = (evaluation: number) => (isBlackToMove ? -evaluation : evaluation);
    const normalizeMate = (mate: string | null) => {
      if (!mate) return null;
      const mateNum = parseInt(mate);
      return isBlackToMove ? (-mateNum).toString() : mate;
    };

    // Priority 1: If we have a valid evaluation from the engine for the current position, use it and cache it
    if (depth > 0 && isEngineEnabled) {
      const normalizedEval = normalizeEval(positionEvaluation);
      const normalizedMate = normalizeMate(possibleMate || null);
      
      // Cache the normalized evaluation for this position
      positionEvalCache.current.set(gameState.position, {
        evaluation: normalizedEval,
        possibleMate: normalizedMate,
      });
      
      return {
        evaluation: normalizedEval,
        possibleMate: normalizedMate,
      };
    }
    
    // Priority 2: If analyzing or waiting, use cached evaluation for this position if available
    // This keeps the current position's evaluation stable until new analysis arrives
    if (isEngineEnabled) {
      const cached = positionEvalCache.current.get(gameState.position);
      if (cached && (cached.evaluation !== 0 || cached.possibleMate)) {
        return {
          evaluation: cached.evaluation,
          possibleMate: cached.possibleMate,
        };
      }
    }
    
    // Priority 3: Engine disabled or no cached evaluation for this position (show neutral/0)
    return { evaluation: 0, possibleMate: null };
  }, [
    depth,
    positionEvaluation,
    possibleMate,
    isEngineEnabled,
    isAnalyzing,
    gameState.position,
  ]);

  const { opening, detectOpening } = useOpeningDetection();

  // Detect opening when moves change
  useEffect(() => {
    detectOpening(gameState.moves);
  }, [gameState.moves, detectOpening]);

  const formattedEngineLines = useMemo(() => {
    // Determine whose turn it is to negate evaluations if needed
    const chess = new Chess();
    try {
      chess.load(gameState.position);
    } catch {
      // Invalid position, return lines as-is
      return engineLines.map((line) => ({
        sanNotation: convertUCIToSAN(line.moves, gameState.position),
        evaluation: line.evaluation,
        depth: line.depth,
        possibleMate: line.possibleMate,
      }));
    }
    const isBlackToMove = chess.turn() === "b";

    // Stockfish evaluates from White's perspective
    // When it's Black's turn, negate the evaluation to show it from Black's perspective
    return engineLines.map((line) => {
      const normalizedEval = isBlackToMove ? -line.evaluation : line.evaluation;
      const normalizedMate = line.possibleMate
        ? isBlackToMove
          ? (-parseInt(line.possibleMate)).toString()
          : line.possibleMate
        : null;

      return {
        sanNotation: convertUCIToSAN(line.moves, gameState.position),
        evaluation: normalizedEval,
        depth: line.depth,
        possibleMate: normalizedMate,
      };
    });
  }, [engineLines, gameState.position]);

  const handleMoveClick = useCallback(
    (moveIndex: number) => navigateToMove(moveIndex),
    [navigateToMove],
  );
  const handleBranchMoveClick = useCallback(
    (branchId: string, moveIndexInBranch: number) =>
      navigateToBranchMove(branchId, moveIndexInBranch),
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
    onBranchMoveClick: handleBranchMoveClick,
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
