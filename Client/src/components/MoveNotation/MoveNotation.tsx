import { ChessMove, MoveBranch } from "../../types/chess";

interface MoveNotationProps {
  moves: ChessMove[];
  branches: MoveBranch[];
  currentMoveIndex: number;
  onMoveClick: (moveIndex: number) => void;
  opening?: { name: string; eco: string };
}

interface DisplayMove {
  move: string;
  moveNumber: number;
  isWhite: boolean;
  index: number;
  isBranch?: boolean;
  branchIndent?: number;
}

export const MoveNotation = ({
  moves,
  branches,
  currentMoveIndex,
  onMoveClick,
  opening,
}: MoveNotationProps) => {
  const formatMovesWithBranches = (): DisplayMove[] => {
    const result: DisplayMove[] = [];
    let branchIndex = 0;

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;

      // Add main line move
      result.push({
        move: move.san,
        moveNumber: isWhite ? moveNumber : 0,
        isWhite,
        index: i,
      });

      // Check if there's a branch starting after this move
      const branchAtThisPosition = branches.find(
        (b) => b.startIndex === i,
      );

      if (branchAtThisPosition && branchAtThisPosition.moves.length > 0) {
        // Add branch moves with indentation
        // If we're after a white move (even index), branch starts with black's move
        // If we're after a black move (odd index), branch starts with white's move
        const currentMoveNumber = Math.floor(i / 2) + 1;
        let isBranchWhite = !isWhite; // Branch starts with opposite color
        let branchMoveNumber = isBranchWhite
          ? currentMoveNumber + 1
          : currentMoveNumber; // If branch starts with black, use current move number

        // Add vertical line indicator for branch
        result.push({
          move: "|",
          moveNumber: 0,
          isWhite: false,
          index: -1,
          isBranch: true,
          branchIndent: 1,
        });

        for (
          let branchMoveIdx = 0;
          branchMoveIdx < branchAtThisPosition.moves.length;
          branchMoveIdx++
        ) {
          const branchMove = branchAtThisPosition.moves[branchMoveIdx];

          result.push({
            move: branchMove.san,
            moveNumber: isBranchWhite ? branchMoveNumber : currentMoveNumber,
            isWhite: isBranchWhite,
            index: -1, // Branch moves don't have main line index
            isBranch: true,
            branchIndent: 1,
          });

          if (isBranchWhite) {
            branchMoveNumber++;
          }
          isBranchWhite = !isBranchWhite;
        }
      }
    }

    return result;
  };

  const formattedMoves = formatMovesWithBranches();

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
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
            {formattedMoves.map((item, displayIndex) => {
              // Handle branch markers (vertical line)
              if (item.isBranch && item.move === "|") {
                return (
                  <div
                    key={`branch-${displayIndex}`}
                    className="flex w-full items-center"
                    style={{ marginLeft: item.branchIndent ? "0.5rem" : "0" }}
                  >
                    <span className="text-muted-foreground mr-1 text-xs">
                      |
                    </span>
                  </div>
                );
              }

              // Handle regular moves
              return (
                <div
                  key={`move-${displayIndex}`}
                  className="flex items-center"
                  style={{
                    marginLeft:
                      item.isBranch && item.branchIndent
                        ? `${item.branchIndent * 0.75}rem`
                        : "0",
                  }}
                >
                  {item.isWhite && item.moveNumber > 0 && (
                    <span className="text-muted-foreground mr-1 font-medium">
                      {item.moveNumber}.
                    </span>
                  )}
                  {item.isBranch && !item.isWhite && item.moveNumber > 0 && (
                    <span className="text-muted-foreground mr-1">
                      {item.moveNumber}...
                    </span>
                  )}
                  {item.index >= 0 ? (
                    <button
                      onClick={() => onMoveClick(item.index)}
                      className={`rounded px-2 py-1 transition-colors ${
                        item.index === currentMoveIndex
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      } ${item.isBranch ? "text-muted-foreground" : ""}`}
                    >
                      {item.move}
                    </button>
                  ) : (
                    <span
                      className={`px-2 py-1 ${
                        item.isBranch
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item.move}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
