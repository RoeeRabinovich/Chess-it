import { MoveNotation } from "../../../components/MoveNotation/MoveNotation";
import { ChessControls } from "../../../components/ChessControls/ChessControls";
import { EngineLines } from "../../../components/EngineLines/EngineLines";
import { MoveComment } from "./MoveComment";
import { ChessMove, MoveBranch } from "../../../types/chess";

interface ToolsSidebarProps {
  // Engine Analysis
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  engineLines: Array<{
    moves: string[];
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  formattedEngineLines: Array<{
    sanNotation: string;
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;

  // Move History
  moves: ChessMove[];
  branches?: MoveBranch[];
  currentMoveIndex: number;
  onMoveClick: (moveIndex: number) => void;
  onBranchMoveClick?: (branchId: string, moveIndexInBranch: number) => void;
  opening?: { name: string; eco: string };

  // Game Controls
  onFlipBoard: () => void;
  onUndo: () => void;
  onReset: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  canUndo: boolean;
  canGoToPreviousMove: boolean;
  canGoToNextMove: boolean;
  onPreviousMove: () => void;
  onNextMove: () => void;
  // Settings props
  isEngineEnabledForSettings: boolean;
  onEngineToggle: (enabled: boolean) => void;
  engineLinesCount: number;
  onEngineLinesCountChange: (count: number) => void;
  engineDepth: number;
  onEngineDepthChange: (depth: number) => void;
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;

  // Comments
  currentMoveComment: string;
  onSaveComment: (comment: string) => void;
  canComment: boolean;
  comments?: Map<string, string>;
  readOnlyComments?: boolean;

  // Create Study
  onCreateStudy?: () => void;
}

export const ToolsSidebar = ({
  isEngineEnabled,
  isAnalyzing,
  formattedEngineLines,
  moves,
  branches,
  currentMoveIndex,
  onMoveClick,
  onBranchMoveClick,
  opening,
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
  currentMoveComment,
  onSaveComment,
  canComment,
  comments,
  readOnlyComments = false,
  onCreateStudy,
}: ToolsSidebarProps) => {
  return (
    <div className="bg-card flex h-full max-h-full flex-col overflow-hidden p-1.5 sm:p-2 lg:p-4">
      {/* Engine Lines Section - Always show, but conditionally show content */}
      <>
        <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
          {isEngineEnabled && (
            <div
              className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${isAnalyzing ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
            ></div>
          )}
          <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
            Engine Lines
          </span>
        </div>
        <div className="mb-2 flex min-h-[60px] flex-col sm:mb-3 sm:min-h-[80px] lg:mb-4 lg:min-h-[120px]">
          {moves.length === 0 ? (
            // Show placeholder only if no moves have been made
            <div className="flex flex-1 items-center justify-center">
              <span className="text-muted-foreground text-[10px] sm:text-xs">
                Make a move to see engine analysis
              </span>
            </div>
          ) : (
            // Always show EngineLines container when moves exist (even if empty during analysis)
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
          )}
        </div>
        <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />
      </>

      {/* Move History Section */}
      <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 lg:mb-3">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2"></div>
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          Move History
        </span>
      </div>
      <div className="mb-2 flex-1 overflow-y-auto sm:mb-3 lg:mb-4">
        <MoveNotation
          moves={moves}
          branches={branches}
          currentMoveIndex={currentMoveIndex}
          onMoveClick={onMoveClick}
          onBranchMoveClick={onBranchMoveClick}
          opening={opening}
          comments={comments}
        />
      </div>
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />

      {/* Move Comment Section */}
      <div className="mb-2 flex-shrink-0 sm:mb-3 lg:mb-4">
        <MoveComment
          currentMoveComment={currentMoveComment}
          onSaveComment={onSaveComment}
          canComment={canComment}
          readOnly={readOnlyComments}
        />
      </div>
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />

      {/* Game Controls Section */}
      <div className="flex-shrink-0 pt-1 sm:pt-0">
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
