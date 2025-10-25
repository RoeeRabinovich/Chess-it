import { ChessMove } from "../../types/chess";

interface MoveNotationProps {
  moves: ChessMove[];
  currentMoveIndex: number;
  onMoveClick: (moveIndex: number) => void;
  opening?: { name: string; eco: string };
}

export const MoveNotation = ({
  moves,
  currentMoveIndex,
  onMoveClick,
  opening,
}: MoveNotationProps) => {
  const formatMoves = () => {
    const formattedMoves: Array<{
      move: string;
      moveNumber: number;
      isWhite: boolean;
      index: number;
    }> = [];

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;

      formattedMoves.push({
        move: move.san,
        moveNumber: isWhite ? moveNumber : 0,
        isWhite,
        index: i,
      });
    }

    return formattedMoves;
  };

  const formattedMoves = formatMoves();

  return (
    <div className="bg-card h-full rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-foreground mb-2 text-lg font-semibold">Opening</h3>
        {opening ? (
          <div>
            <p className="text-foreground text-sm font-medium">
              {opening.name}
            </p>
            <p className="text-muted-foreground text-xs">{opening.eco}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Custom Position</p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-foreground mb-2 text-lg font-semibold">Moves</h3>
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1 text-sm">
            {formattedMoves.map((item, index) => (
              <div key={index} className="flex">
                {item.isWhite && (
                  <span className="text-muted-foreground w-8 font-medium">
                    {item.moveNumber}.
                  </span>
                )}
                <button
                  onClick={() => onMoveClick(item.index)}
                  className={`flex-1 rounded px-2 py-1 text-left transition-colors ${
                    item.index === currentMoveIndex
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.move}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
