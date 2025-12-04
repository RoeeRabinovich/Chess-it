import { useState, useEffect } from "react";
import { ChessControls } from "../../../components/ChessControls/ChessControls";
import { MoveComment } from "../components/MoveComment";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { StudyLayoutProps } from "../../../types/studyLayout";
import { ChessMove } from "../../../types/chess";
import { MobileTopSection } from "../components/MobileTopSection";
import { MobileEvalBar } from "../components/MobileEvalBar";
import { MobileMoveHistory } from "../components/MobileMoveHistory";

export const MobileStudyLayout = ({
  gameState,
  makeMove,
  onMoveClick,
  currentPath,
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
  analysisMode,
  onAnalysisModeChange,
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
  studyId,
  isLiked,
  likesCount,
  isLiking,
  onLike,
  onUnlike,
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
      <MobileTopSection
        studyName={studyName}
        studyCategory={studyCategory}
        studyDescription={studyDescription}
        studyId={studyId}
        isLiked={isLiked}
        likesCount={likesCount}
        isLiking={isLiking}
        onLike={onLike}
        onUnlike={onUnlike}
        isEngineEnabled={isEngineEnabled}
        isAnalyzing={isAnalyzing}
        formattedEngineLines={formattedEngineLines}
        moveTree={gameState.moveTree}
      />

      <MobileEvalBar
        isEngineEnabled={isEngineEnabled}
        evalBarWidth={evalBarWidth}
        boardScale={boardScale}
        evaluation={displayEvaluation.evaluation}
        possibleMate={displayEvaluation.possibleMate}
        isFlipped={gameState.isFlipped}
      />

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

      <MobileMoveHistory
        moveTree={gameState.moveTree}
        rootBranches={gameState.rootBranches}
        currentPath={currentPath}
        onMoveClick={onMoveClick}
        opening={opening}
        comments={gameState.comments}
      />

      {/* Move Comment */}
      <MoveComment
        currentMoveComment={currentMoveComment}
        onSaveComment={onSaveComment}
        canComment={currentPath.length > 0}
        readOnly={readOnlyComments}
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
          analysisMode={analysisMode}
          onAnalysisModeChange={onAnalysisModeChange}
          boardScale={boardScale}
          onBoardScaleChange={onBoardScaleChange}
          onCreateStudy={onCreateStudy}
        />
      </div>
    </div>
  );
};
