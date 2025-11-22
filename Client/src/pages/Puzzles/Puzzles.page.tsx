import { useState } from "react";
import { PuzzlesLayout } from "./layouts/PuzzlesLayout";
import { MoveData } from "../../types/chess";

export const Puzzles = () => {
  // Placeholder puzzle position (starting position for now)
  const [puzzlePosition] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [isFlipped] = useState(false);
  const [boardScale] = useState(1.0);

  // Placeholder move handler
  const handleMove = (move: MoveData): boolean => {
    // TODO: Implement puzzle move validation
    console.log("Move made:", move);
    return true;
  };

  // Placeholder sidebar content (will be replaced with PuzzlesSidebar component)
  const sidebarContent = (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-muted-foreground text-center">
        <p>Sidebar content coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-background flex h-screen overflow-hidden pt-16 sm:pt-20 md:pt-24">
      <PuzzlesLayout
        position={puzzlePosition}
        onMove={handleMove}
        isFlipped={isFlipped}
        boardScale={boardScale}
        sidebarContent={sidebarContent}
      />
    </div>
  );
};
