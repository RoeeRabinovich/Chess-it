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
    </div>
  );
};
