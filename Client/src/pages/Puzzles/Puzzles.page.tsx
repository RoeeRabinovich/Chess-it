import { useState, useEffect } from "react";
import { PuzzlesLayout } from "./layouts/PuzzlesLayout";
import { PuzzlesSidebar } from "./components/PuzzlesSidebar";
import { MoveData } from "../../types/chess";

export const Puzzles = () => {
  // Placeholder puzzle position (starting position for now)
  const [puzzlePosition] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [isFlipped] = useState(false);
  const [boardScale] = useState(1.0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  // Selected themes (default to middlegame and advantage)
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    "middlegame",
    "advantage",
  ]);

  // Start timer when puzzle loads (reset when puzzle changes)
  useEffect(() => {
    setIsTimerRunning(true);
  }, [puzzlePosition]);

  // Placeholder move handler
  const handleMove = (move: MoveData): boolean => {
    // TODO: Implement puzzle move validation
    console.log("Move made:", move);

    // TODO: Check if puzzle is solved after this move
    // For now, this is a placeholder
    // When puzzle is solved, stop the timer
    // setIsPuzzleSolved(true);
    // setIsTimerRunning(false);

    return true;
  };

  // Handle timer stop callback
  const handleTimerStop = () => {
    setIsTimerRunning(false);
  };

  // Handle themes change
  const handleThemesChange = (themes: string[]) => {
    setSelectedThemes(themes);
  };

  // Sidebar content with PuzzlesSidebar component
  const sidebarContent = (
    <PuzzlesSidebar
      isTimerRunning={isTimerRunning}
      onTimerStop={handleTimerStop}
      puzzleKey={puzzlePosition}
      selectedThemes={selectedThemes}
      onThemesChange={handleThemesChange}
    />
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
