import { Button } from "../../components/ui/Button";

interface ChessControlsProps {
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

export const ChessControls = ({
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
}: ChessControlsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Board Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onFlipBoard}>
          Flip Board
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      {/* Move Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          Redo
        </Button>
      </div>

      {/* Import Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onLoadFEN}>
          Load FEN
        </Button>
        <Button variant="outline" size="sm" onClick={onLoadPGN}>
          Load PGN
        </Button>
      </div>

      {/* Board Size Control */}
      <div className="flex items-center gap-2">
        <label className="text-foreground text-sm">
          Size: {Math.round(boardScale * 100)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={boardScale}
          onChange={(e) => onBoardScaleChange(parseFloat(e.target.value))}
          className="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        />
      </div>
    </div>
  );
};
