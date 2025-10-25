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
    <div className="h-full rounded-lg bg-white p-4 dark:bg-gray-900">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Opening
        </h3>
        {opening ? (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {opening.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {opening.eco}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Custom Position
          </p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Moves
        </h3>
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1 text-sm">
            {formattedMoves.map((item, index) => (
              <div key={index} className="flex">
                {item.isWhite && (
                  <span className="w-8 font-medium text-gray-500 dark:text-gray-400">
                    {item.moveNumber}.
                  </span>
                )}
                <button
                  onClick={() => onMoveClick(item.index)}
                  className={`flex-1 rounded px-2 py-1 text-left ${
                    item.index === currentMoveIndex
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
