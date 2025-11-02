import { MoveNotation } from "../MoveNotation/MoveNotation";
import { ChessControls } from "../ChessControls/ChessControls";
import { EngineLines } from "../EngineLines/EngineLines";
import { ChessMove } from "../../types/chess";

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
  branches?: Array<any>;
  currentMoveIndex: number;
  onMoveClick: (moveIndex: number) => void;
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
  engineLines,
  formattedEngineLines,
  moves,
  branches = [],
  currentMoveIndex,
  onMoveClick,
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
    <div className="flex h-full max-h-full flex-col overflow-hidden bg-card p-4">
      {/* Engine Lines Section */}
      {isEngineEnabled && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isAnalyzing ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
            ></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Engine Lines
            </span>
            {isAnalyzing && (
              <span className="text-muted-foreground text-xs">Analyzing...</span>
            )}
          </div>
          <div className="mb-4">
            {formattedEngineLines.length > 0 ? (
              <EngineLines
                lines={formattedEngineLines.map((line) => ({
                  moves: line.sanNotation.split(" "),
                  evaluation: line.evaluation,
                  depth: line.depth,
                  mate: line.possibleMate ? parseInt(line.possibleMate) : undefined,
                }))}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <div className="text-muted-foreground text-xs py-2">
                Make a move to see engine analysis
              </div>
            )}
          </div>
          <hr className="my-4 border-border/30" />
        </>
      )}

      {/* Move History Section */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Move History
        </span>
      </div>
      <div className="mb-4 flex-1 overflow-y-auto">
        <MoveNotation
          moves={moves}
          currentMoveIndex={currentMoveIndex}
          onMoveClick={onMoveClick}
          opening={opening}
        />
      </div>
      <hr className="my-4 border-border/30" />

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
