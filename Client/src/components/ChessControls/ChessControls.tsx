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
  engineDepth: number;
  onDepthChange: (depth: number) => void;
  autoDepth: boolean;
  onAutoDepthToggle: () => void;
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
  engineDepth,
  onDepthChange,
  autoDepth,
  onAutoDepthToggle,
}: ChessControlsProps) => {
  return (
    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
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

        {/* Engine Controls */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Depth:
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={engineDepth}
              onChange={(e) => onDepthChange(parseInt(e.target.value))}
              className="w-20"
              disabled={autoDepth}
            />
            <span className="w-6 text-sm text-gray-600 dark:text-gray-400">
              {engineDepth}
            </span>
          </div>

          <Button
            variant={autoDepth ? "default" : "outline"}
            size="sm"
            onClick={onAutoDepthToggle}
          >
            Auto Depth
          </Button>
        </div>
      </div>
    </div>
  );
};
