import { useState, useEffect } from "react";
import { EvaluationBar } from "../../../components/EvaluationBar/EvaluationBar";
import { EngineLines } from "../../../components/EngineLines/EngineLines";
import { MoveNotation } from "../../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../../components/ChessControls/ChessControls";
import { MoveComment } from "../components/MoveComment";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { StudyLayoutProps } from "../../../types/studyLayout";
import { ChessMove } from "../../../types/chess";

export const MobileStudyLayout = ({
  gameState,
  makeMove,
  onMoveClick,
  onBranchMoveClick,
  isEngineEnabled,
  isAnalyzing,
  formattedEngineLines,
  displayEvaluation,
  onFlipBoard,
  onUndo,
  onReset,
  onLoadFEN,
  onLoadPGN,
  canUndo,
  canGoToPreviousMove,
  canGoToNextMove,
  onPreviousMove,
  onNextMove,
  isEngineEnabledForSettings,
  onEngineToggle,
  engineLinesCount,
  onEngineLinesCountChange,
  engineDepth,
  onEngineDepthChange,
  boardScale,
  onBoardScaleChange,
  opening,
  currentMoveComment,
  onSaveComment,
  onCreateStudy,
}: StudyLayoutProps) => {
  const [evalBarWidth, setEvalBarWidth] = useState(280);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== "undefined") {
        setEvalBarWidth(Math.min(280, window.innerWidth - 32));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top: Engine Lines (2 lines default) */}
      {gameState.moves.length > 0 && (
        <div className="border-border bg-card w-full max-w-screen border-b py-1.5 sm:py-2">
          <div className="mb-1.5 flex items-center gap-1.5 px-2 sm:px-3">
            {isEngineEnabled && (
              <div
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${isAnalyzing ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
              ></div>
            )}
            <span className="text-muted-foreground shrink-0 text-[10px] font-medium tracking-wide uppercase sm:text-xs">
              Engine Lines
            </span>
          </div>
          <div className="min-h-[50px] w-full max-w-screen overflow-hidden px-2 sm:min-h-[70px] sm:px-3">
            <EngineLines
              lines={formattedEngineLines.slice(0, 2).map((line) => ({
                moves: line.sanNotation.split(" "),
                evaluation: line.evaluation,
                depth: line.depth,
                mate: line.possibleMate
                  ? parseInt(line.possibleMate)
                  : undefined,
              }))}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      )}

      {/* Eval Bar */}
      {isEngineEnabled && (
        <div className="border-border bg-card w-full border-b px-2 py-1.5 sm:px-3 sm:py-2">
          <div
            className="mx-auto flex-shrink-0 transition-all duration-200"
            style={{
              width: `${evalBarWidth * boardScale}px`,
              maxWidth: `min(${280 * boardScale}px, calc(100vw - 32px))`,
              height: `${24 * boardScale}px`,
            }}
          >
            <EvaluationBar
              evaluation={displayEvaluation.evaluation}
              possibleMate={displayEvaluation.possibleMate}
              isFlipped={gameState.isFlipped}
              height={24 * boardScale}
              width={evalBarWidth * boardScale}
            />
          </div>
        </div>
      )}

      {/* Chessboard */}
      <div className="bg-muted/30 flex flex-shrink-0 items-center justify-center p-2 sm:p-3 md:p-4">
        <div className="m-auto">
          <div className="relative z-0 flex-shrink-0 transition-all duration-200">
            <ChessBoard
              position={gameState.position}
              onMove={(move) => makeMove(move as ChessMove)}
              isFlipped={gameState.isFlipped}
              isInteractive={true}
              boardScale={boardScale}
            />
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="border-border bg-card w-full flex-shrink-0 border-t px-2 py-1.5 sm:px-3 sm:py-2">
        <div className="mb-1.5 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
          <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
            Move History
          </span>
        </div>
        <div className="max-h-[150px] overflow-y-auto sm:max-h-[200px]">
          <MoveNotation
            moves={gameState.moves}
            branches={gameState.branches || []}
            currentMoveIndex={gameState.currentMoveIndex}
            onMoveClick={onMoveClick}
            onBranchMoveClick={onBranchMoveClick}
            opening={opening}
            comments={gameState.comments}
          />
        </div>
      </div>

      {/* Move Comment */}
      <MoveComment
        currentMoveComment={currentMoveComment}
        onSaveComment={onSaveComment}
        canComment={gameState.currentMoveIndex >= 0}
      />

      {/* Game Controls */}
      <div className="border-border bg-card w-full border-t px-2 py-1.5 sm:px-3 sm:py-2">
        <ChessControls
          onFlipBoard={onFlipBoard}
          onUndo={onUndo}
          onReset={onReset}
          onLoadFEN={onLoadFEN}
          onLoadPGN={onLoadPGN}
          canUndo={canUndo}
          canGoToPreviousMove={canGoToPreviousMove}
          canGoToNextMove={canGoToNextMove}
          onPreviousMove={onPreviousMove}
          onNextMove={onNextMove}
          isEngineEnabled={isEngineEnabledForSettings}
          onEngineToggle={onEngineToggle}
          engineLinesCount={engineLinesCount}
          onEngineLinesCountChange={onEngineLinesCountChange}
          engineDepth={engineDepth}
          onEngineDepthChange={onEngineDepthChange}
          boardScale={boardScale}
          onBoardScaleChange={onBoardScaleChange}
          onCreateStudy={onCreateStudy}
        />
      </div>
    </div>
  );
};
