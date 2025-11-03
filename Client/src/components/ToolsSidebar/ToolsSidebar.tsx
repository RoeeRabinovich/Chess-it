import { MoveNotation } from "../MoveNotation/MoveNotation";
import { ChessControls } from "../ChessControls/ChessControls";
import { EngineLines } from "../EngineLines/EngineLines";
import { ChessMove, MoveBranch } from "../../types/chess";

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
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onLoadFEN: () => void;
  onLoadPGN: () => void;
  canUndo: boolean;
  canRedo: boolean;
  boardScale: number;
  onBoardScaleChange: (scale: number) => void;
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
  onReset,
  onUndo,
  onRedo,
  onLoadFEN,
  onLoadPGN,
  canUndo,
  canRedo,
  boardScale,
  onBoardScaleChange,
}: ToolsSidebarProps) => {
  return (
    <div className="bg-card flex h-full max-h-full flex-col overflow-hidden p-4">
      {/* Engine Lines Section - Always show, but conditionally show content */}
      <>
        <div className="mb-3 flex items-center gap-2">
          {isEngineEnabled && (
            <div
              className={`h-2 w-2 rounded-full ${isAnalyzing ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
            ></div>
          )}
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Engine Lines
          </span>
        </div>
        <div className="mb-4 flex min-h-[120px] flex-col">
          {moves.length === 0 ? (
            // Show placeholder only if no moves have been made
            <div className="flex flex-1 items-center justify-center">
              <span className="text-muted-foreground text-xs">
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
            />
          )}
        </div>
        <hr className="border-border/30 my-4" />
      </>

      {/* Move History Section */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Move History
        </span>
      </div>
      <div className="mb-4 flex-1 overflow-y-auto">
        <MoveNotation
          moves={moves}
          branches={branches}
          currentMoveIndex={currentMoveIndex}
          onMoveClick={onMoveClick}
          onBranchMoveClick={onBranchMoveClick}
          opening={opening}
        />
      </div>
      <hr className="border-border/30 my-4" />

      {/* Game Controls Section */}
      <div className="flex-shrink-0">
        <ChessControls
          onFlipBoard={onFlipBoard}
          onReset={onReset}
          onUndo={onUndo}
          onRedo={onRedo}
          onLoadFEN={onLoadFEN}
          onLoadPGN={onLoadPGN}
          canUndo={canUndo}
          canRedo={canRedo}
          boardScale={boardScale}
          onBoardScaleChange={onBoardScaleChange}
        />
      </div>
    </div>
  );
};
