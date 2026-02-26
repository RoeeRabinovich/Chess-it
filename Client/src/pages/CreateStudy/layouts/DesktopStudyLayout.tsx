import { EvaluationBar } from "../../../components/EvaluationBar/EvaluationBar";
import { ToolsSidebar } from "../components/ToolsSidebar";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { ChessMove } from "../../../types/chess";
import { StudyLayoutProps } from "../../../types/studyLayout";

export const DesktopStudyLayout = ({
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
  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      {/* Left Column - Evaluation Bar + Board */}
      <div className="bg-muted/30 relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-4 md:pl-8 md:max-w-[calc(100%-288px)] lg:max-h-screen lg:max-w-[calc(100%-400px)] lg:p-6">
        <div className="flex items-stretch justify-center">
          {/* Desktop: Vertical evaluation bar on left */}
          {isEngineEnabled && (
            <div
              className="relative z-10 hidden flex-shrink-0 transition-all duration-200 md:block"
              style={{ width: `${20 * boardScale}px` }}
            >
              <EvaluationBar
                evaluation={displayEvaluation.evaluation}
                possibleMate={displayEvaluation.possibleMate}
                isFlipped={gameState.isFlipped}
                height="100%"
                width={20 * boardScale}
              />
            </div>
          )}
          {/* 4px gap between eval bar and board (scaled) */}
          {isEngineEnabled && (
            <div
              className="hidden flex-shrink-0 transition-all duration-200 md:block"
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
      <div className="border-border bg-background w-full border-l md:w-72 md:max-w-72 md:min-w-72 lg:w-[400px] lg:max-w-[400px] lg:min-w-[400px]">
        <div className="flex h-full flex-col overflow-hidden">
          <ToolsSidebar
            isEngineEnabled={isEngineEnabled}
            isAnalyzing={isAnalyzing}
            formattedEngineLines={formattedEngineLines}
            moveTree={gameState.moveTree}
            rootBranches={gameState.rootBranches}
            currentPath={currentPath}
            onMoveClick={onMoveClick}
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
            analysisMode={analysisMode}
            onAnalysisModeChange={onAnalysisModeChange}
            boardScale={boardScale}
            onBoardScaleChange={onBoardScaleChange}
            currentMoveComment={currentMoveComment}
            onSaveComment={onSaveComment}
            canComment={currentPath.length > 0}
            comments={gameState.comments}
            readOnlyComments={readOnlyComments}
            onCreateStudy={onCreateStudy}
            studyName={studyName}
            studyCategory={studyCategory}
            studyDescription={studyDescription}
            studyId={studyId}
            isLiked={isLiked}
            likesCount={likesCount}
            isLiking={isLiking}
            onLike={onLike}
            onUnlike={onUnlike}
          />
        </div>
      </div>
    </div>
  );
};
