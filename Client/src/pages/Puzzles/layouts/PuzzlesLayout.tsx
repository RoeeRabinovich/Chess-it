import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { MoveData } from "../../../types/chess";

interface PuzzlesLayoutProps {
  // Puzzle position (FEN)
  position: string;
  // Handle moves
  onMove?: (move: MoveData) => boolean | void;
  // Board flipped state
  isFlipped?: boolean;
  // Board scale
  boardScale?: number;
  // Right sidebar content (will be PuzzlesSidebar component)
  sidebarContent: React.ReactNode;
  // Square to highlight as wrong move
  wrongMoveSquare?: string | null;
  // Whether the board is interactive
  isInteractive?: boolean;
  // Content to display above the board (rating, turn indicator)
  topContent?: React.ReactNode;
}

export const PuzzlesLayout = ({
  position,
  onMove,
  isFlipped = false,
  boardScale = 1.0,
  sidebarContent,
  wrongMoveSquare,
  isInteractive = true,
  topContent,
}: PuzzlesLayoutProps) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Left/Top Column - Chessboard Area */}
      <div className="bg-muted/30 relative flex min-h-0 flex-1 flex-col overflow-hidden lg:max-w-[calc(100%-350px)]">
        {/* Top Content (Rating & Turn) - Mobile/Tablet */}
        {topContent && (
          <div className="border-border bg-background flex-shrink-0 border-b px-2 py-1 sm:px-3 sm:py-1.5 lg:hidden">
            {topContent}
          </div>
        )}

        {/* Board Container - Maximize space, especially on mobile */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-0.5 sm:p-1 md:p-2 lg:p-4">
          <div className="flex h-full w-full items-center justify-center">
            {/* Board */}
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative z-0 flex-shrink-0 transition-all duration-200">
                <ChessBoard
                  position={position}
                  onMove={onMove}
                  isFlipped={isFlipped}
                  isInteractive={isInteractive}
                  boardScale={boardScale}
                  wrongMoveSquare={wrongMoveSquare}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right/Bottom Column - Puzzles Sidebar */}
      <div className="border-border bg-background flex-shrink-0 w-full border-t max-h-[40vh] lg:max-h-none lg:w-[350px] lg:max-w-[350px] lg:min-w-[350px] lg:border-t-0 lg:border-l">
        <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};
