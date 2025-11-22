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
}

export const PuzzlesLayout = ({
  position,
  onMove,
  isFlipped = false,
  boardScale = 1.0,
  sidebarContent,
}: PuzzlesLayoutProps) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Left/Top Column - Chessboard */}
      <div className="bg-muted/30 relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-4 lg:max-h-screen lg:max-w-[calc(100%-400px)] lg:p-6">
        <div className="flex items-center justify-center">
          {/* Board */}
          <div className="relative flex items-center justify-center">
            <div className="relative z-0 flex-shrink-0 transition-all duration-200">
              <ChessBoard
                position={position}
                onMove={onMove}
                isFlipped={isFlipped}
                isInteractive={true}
                boardScale={boardScale}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right/Bottom Column - Puzzles Sidebar */}
      <div className="border-border bg-background w-full border-t lg:w-[400px] lg:max-w-[400px] lg:min-w-[400px] lg:border-t-0 lg:border-l">
        <div className="flex h-full flex-col overflow-hidden">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};
