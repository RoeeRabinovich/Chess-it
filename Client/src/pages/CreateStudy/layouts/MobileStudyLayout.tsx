import { useState, useEffect } from "react";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { StudyLayoutProps } from "../../../types/studyLayout";
import { ChessMove } from "../../../types/chess";
import { EvaluationBar } from "../../../components/EvaluationBar/EvaluationBar";
import { TreeMoveNotation } from "../../../components/MoveNotation/TreeMoveNotation";
import { EngineLines } from "../../../components/EngineLines/EngineLines";
import { StudyMetadata } from "../components/StudyMetadata";
import { Button } from "../../../components/ui/Button";
import { SettingsModal } from "../components/SettingsModal";
import { LeftArrow } from "../../../components/icons/LeftArrow.icon";
import { RightArrow } from "../../../components/icons/RightArrow.icon";
import { Undo } from "../../../components/icons/Undo.icon";
import { Flip } from "../../../components/icons/Flip.icon";
import { Book } from "../../../components/icons/Book.icon";
import { Settings } from "../../../components/icons/Settings.icon";
import { Heart } from "lucide-react";
import { apiService } from "../../../services/api";
import { cn } from "../../../lib/utils";

type MobileTab = "moves" | "comment" | "engine";

const calculateMobileBoardSize = (): number => {
  if (typeof window === "undefined") return 300;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const availH = h - 200;
  const availW = w - 32;
  return Math.min(availW, availH, 350);
};

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: boolean;
}

const TabButton = ({ label, active, onClick, dot }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 py-2 text-[10px] font-medium tracking-wide uppercase transition-colors",
      active
        ? "border-b-2 border-foreground text-foreground"
        : "text-muted-foreground hover:text-foreground",
    )}
  >
    {label}
    {dot && (
      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-purple-500 align-middle" />
    )}
  </button>
);

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
  const [activeTab, setActiveTab] = useState<MobileTab>("moves");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [commentText, setCommentText] = useState(currentMoveComment);
  const [boardSize, setBoardSize] = useState(calculateMobileBoardSize);

  // Sync comment text when navigating between moves
  useEffect(() => {
    setCommentText(currentMoveComment);
  }, [currentMoveComment]);

  // Reset to Moves tab when navigating back to starting position
  useEffect(() => {
    if (currentPath.length === 0 && activeTab === "comment") {
      setActiveTab("moves");
    }
  }, [currentPath.length, activeTab]);

  useEffect(() => {
    const update = () => setBoardSize(calculateMobileBoardSize());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const canShowCommentTab = currentPath.length > 0;
  const hasComment = !!currentMoveComment && currentMoveComment.trim() !== "";

  const evalBarWidth = 12;
  const evalBarGap = 4;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Board area */}
      <div className="bg-muted/30 flex flex-shrink-0 items-center justify-center p-2">
        {isEngineEnabled && (
          <div
            className="mr-1 flex-shrink-0 transition-all duration-200"
            style={{
              width: `${evalBarWidth * boardScale}px`,
              height: `${boardSize * boardScale}px`,
              marginRight: `${evalBarGap}px`,
            }}
          >
            <EvaluationBar
              evaluation={displayEvaluation.evaluation}
              possibleMate={displayEvaluation.possibleMate}
              isFlipped={gameState.isFlipped}
              height={boardSize * boardScale}
              width={evalBarWidth * boardScale}
            />
          </div>
        )}
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

      {/* Compact controls row */}
      <div className="border-border bg-card flex-shrink-0 border-t px-2 py-1">
        <div className="flex items-center gap-1">
          {/* Prev / Next — primary navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMove}
            disabled={!canGoToPreviousMove}
            aria-label="Previous move"
            className="bg-secondary h-10 flex-1"
          >
            <LeftArrow className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMove}
            disabled={!canGoToNextMove}
            aria-label="Next move"
            className="bg-secondary h-10 flex-1"
          >
            <RightArrow className="h-5 w-5" />
          </Button>

          {/* Divider */}
          <div className="bg-border mx-0.5 h-5 w-px flex-shrink-0" />

          {/* Secondary actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo move"
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFlipBoard}
            aria-label="Flip board"
            className="h-8 w-8"
          >
            <Flip className="h-4 w-4" />
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side: Save Study + Settings */}
          {onCreateStudy && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateStudy}
              aria-label="Save as study"
              className="h-8 w-8"
            >
              <Book className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabbed bottom panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="border-border bg-card flex flex-shrink-0 border-t">
          <TabButton
            label="Moves"
            active={activeTab === "moves"}
            onClick={() => setActiveTab("moves")}
          />
          {canShowCommentTab && (
            <TabButton
              label="Comment"
              active={activeTab === "comment"}
              onClick={() => setActiveTab("comment")}
              dot={hasComment}
            />
          )}
          {isEngineEnabled && (
            <TabButton
              label="Engine"
              active={activeTab === "engine"}
              onClick={() => setActiveTab("engine")}
            />
          )}
        </div>

        {/* Tab content */}
        <div className="bg-card flex-1 overflow-y-auto">
          {/* Moves tab */}
          {activeTab === "moves" && (
            <div className="px-2 py-1.5">
              {/* Study info in review mode */}
              {studyName && (
                <div className="mb-2 pb-2 border-b border-border">
                  <StudyMetadata
                    studyName={studyName}
                    studyCategory={studyCategory}
                    studyDescription={studyDescription}
                  />
                  {studyId && apiService.isAuthenticated() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isLiked ? onUnlike : onLike}
                      disabled={isLiking}
                      className="mt-2 w-full justify-center gap-2"
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-red-300 text-red-300" : ""}`}
                      />
                      <span className="text-xs">
                        {isLiked ? "Liked" : "Like"}
                      </span>
                      {likesCount !== undefined && likesCount > 0 && (
                        <span className="text-xs">({likesCount})</span>
                      )}
                    </Button>
                  )}
                </div>
              )}
              <TreeMoveNotation
                moveTree={gameState.moveTree}
                rootBranches={gameState.rootBranches}
                currentPath={currentPath}
                onMoveClick={onMoveClick}
                opening={opening}
                comments={gameState.comments}
              />
            </div>
          )}

          {/* Comment tab */}
          {activeTab === "comment" && canShowCommentTab && (
            <div className="px-2 py-1.5">
              {readOnlyComments ? (
                hasComment ? (
                  <div className="text-foreground bg-muted/50 px-2 py-2 text-xs">
                    {currentMoveComment}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No comment for this move.
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a note for this move..."
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={4}
                    maxLength={1000}
                  />
                  <Button
                    onClick={() => onSaveComment(commentText)}
                    size="sm"
                    className="w-full"
                  >
                    Save Note
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Engine tab */}
          {activeTab === "engine" && isEngineEnabled && (
            <div className="px-2 py-1.5">
              <EngineLines
                lines={formattedEngineLines.map((line) => ({
                  moves: line.sanNotation.split(" "),
                  evaluation: line.evaluation,
                  depth: line.depth,
                  mate: line.possibleMate
                    ? parseInt(line.possibleMate)
                    : undefined,
                }))}
                isAnalyzing={isAnalyzing}
                maxLines={engineLinesCount}
              />
            </div>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLoadFEN={onLoadFEN}
        onLoadPGN={onLoadPGN}
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
      />
    </div>
  );
};
