import { useState, useEffect } from "react";
import { EvaluationBar } from "../../../components/EvaluationBar/EvaluationBar";
import { ToolsSidebar } from "../components/ToolsSidebar";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { ChessMove } from "../../../types/chess";
import { StudyLayoutProps } from "../../../types/studyLayout";

export const DesktopStudyLayout = ({
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
  readOnlyComments = false,
  onCreateStudy,
  studyName,
  studyCategory,
  studyDescription,
}: StudyLayoutProps) => {
  // Calculate board size to match ChessBoard component logic
  const [boardSize, setBoardSize] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width >= 1024) return 550; // lg desktop
      if (width >= 768) return 400; // md tablet
      return 400; // default
    }
    return 550; // default fallback
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      let newSize = 550;
      if (width >= 1024) {
        newSize = 550; // lg
      } else if (width >= 768) {
        newSize = 400; // md
      } else {
        newSize = 400; // default
      }
      setBoardSize(newSize);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      {/* Left Column - Evaluation Bar + Board */}
      <div className="bg-muted/30 relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-4 lg:max-h-screen lg:max-w-[calc(100%-400px)] lg:p-6">
        <div className="flex items-center justify-center">
          {/* Desktop: Vertical evaluation bar on left */}
          {isEngineEnabled && (
            <div className="hidden lg:block">
              <div
                className="relative z-10 flex-shrink-0 transition-all duration-200"
                style={{
                  width: `${20 * boardScale}px`,
                  height: `${boardSize * boardScale}px`,
                }}
              >
                <EvaluationBar
                  evaluation={displayEvaluation.evaluation}
                  possibleMate={displayEvaluation.possibleMate}
                  isFlipped={gameState.isFlipped}
                  height={boardSize * boardScale}
                  width={20 * boardScale}
                />
              </div>
            </div>
          )}
          {/* 4px gap between eval bar and board (scaled) */}
          {isEngineEnabled && (
            <div
              className="hidden flex-shrink-0 transition-all duration-200 lg:block"
              style={{
                width: `${4 * boardScale}px`,
              }}
            />
          )}
          {/* Board */}
          <div className="relative flex items-center justify-center">
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
      </div>

      {/* Right Column - Tools Sidebar */}
      <div className="border-border bg-background w-full border-l lg:w-[400px] lg:max-w-[400px] lg:min-w-[400px]">
        <div className="flex h-full flex-col overflow-hidden">
          <ToolsSidebar
            isEngineEnabled={isEngineEnabled}
            isAnalyzing={isAnalyzing}
            engineLines={[]} // Not used in desktop sidebar
            formattedEngineLines={formattedEngineLines}
            moves={gameState.moves}
            branches={gameState.branches || []}
            currentMoveIndex={gameState.currentMoveIndex}
            onMoveClick={onMoveClick}
            onBranchMoveClick={onBranchMoveClick}
            opening={opening}
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
            isEngineEnabledForSettings={isEngineEnabledForSettings}
            onEngineToggle={onEngineToggle}
            engineLinesCount={engineLinesCount}
            onEngineLinesCountChange={onEngineLinesCountChange}
            engineDepth={engineDepth}
            onEngineDepthChange={onEngineDepthChange}
            boardScale={boardScale}
            onBoardScaleChange={onBoardScaleChange}
            currentMoveComment={currentMoveComment}
            onSaveComment={onSaveComment}
            canComment={gameState.currentMoveIndex >= 0}
            comments={gameState.comments}
            readOnlyComments={readOnlyComments}
            onCreateStudy={onCreateStudy}
            studyName={studyName}
            studyCategory={studyCategory}
            studyDescription={studyDescription}
          />
        </div>
      </div>
    </div>
  );
};
