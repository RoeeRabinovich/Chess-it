import { TreeMoveNotation } from "../../../components/MoveNotation/TreeMoveNotation";
import { ChessControls } from "../../../components/ChessControls/ChessControls";
import { MoveComment } from "./MoveComment";
import { MovePath } from "../../../types/chess";
import { StudyInfoSection } from "./StudyInfoSection";
import { EngineLinesSection } from "./EngineLinesSection";
import { SectionHeader } from "./SectionHeader";
import { getMainLineMoves } from "../../../utils/moveTreeUtils";

interface ToolsSidebarProps {
  // Engine Analysis
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  formattedEngineLines: Array<{
    sanNotation: string;
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;

  // Move History
  moveTree: import("../../../types/chess").MoveNode[];
  rootBranches: import("../../../types/chess").MoveNode[][];
  currentPath: MovePath;
  onMoveClick: (path: MovePath) => void;
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
  analysisMode: "quick" | "deep";
  onAnalysisModeChange: (mode: "quick" | "deep") => void;
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

  // Study metadata (for review mode)
  studyName?: string;
  studyCategory?: string;
  studyDescription?: string;

  // Like functionality (for review mode)
  studyId?: string;
  isLiked?: boolean;
  likesCount?: number;
  isLiking?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
}

export const ToolsSidebar = ({
  isEngineEnabled,
  isAnalyzing,
  formattedEngineLines,
  moveTree,
  rootBranches,
  currentPath,
  onMoveClick,
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
  analysisMode,
  onAnalysisModeChange,
  boardScale,
  onBoardScaleChange,
  currentMoveComment,
  onSaveComment,
  canComment,
  comments,
  readOnlyComments = false,
  onCreateStudy,
  studyName,
  studyCategory,
  studyDescription,
  studyId,
  isLiked,
  isLiking,
  onLike,
  onUnlike,
}: ToolsSidebarProps) => {
  const isReviewMode = !!(studyName || studyCategory || studyDescription);

  return (
    <div className="bg-card flex h-full max-h-full flex-col overflow-hidden p-1.5 sm:p-2 lg:p-4">
      {isReviewMode ? (
        <StudyInfoSection
          studyName={studyName}
          studyCategory={studyCategory}
          studyDescription={studyDescription}
          studyId={studyId}
          isLiked={isLiked}
          isLiking={isLiking}
          onLike={onLike}
          onUnlike={onUnlike}
        />
      ) : (
        <EngineLinesSection
          isEngineEnabled={isEngineEnabled}
          isAnalyzing={isAnalyzing}
          formattedEngineLines={formattedEngineLines}
          engineLinesCount={engineLinesCount}
          movesCount={getMainLineMoves(moveTree).length}
        />
      )}

      <SectionHeader title="Move History" />
      <div className="mb-2 flex-1 overflow-y-auto sm:mb-3 lg:mb-4">
        <TreeMoveNotation
          moveTree={moveTree}
          rootBranches={rootBranches}
          currentPath={currentPath}
          onMoveClick={onMoveClick}
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
