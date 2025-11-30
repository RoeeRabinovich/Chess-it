import { ChessMove, MoveBranch, BranchContext } from "../../types/chess";
import { Badge } from "../ui/Badge";
import { useMoveNotationScroll } from "./useMoveNotationScroll";
import { useFormattedMovePairs } from "./useFormattedMovePairs";
import { hasComment } from "./moveNotationUtils";
import { MoveButton } from "./MoveButton";
import { BranchNotation } from "./BranchNotation";

interface MoveNotationProps {
  moves: ChessMove[];
  branches?: MoveBranch[];
  currentMoveIndex: number;
  currentBranchContext?: BranchContext | null;
  onMoveClick: (moveIndex: number) => void;
  onBranchMoveClick?: (branchId: string, moveIndexInBranch: number) => void;
  opening?: { name: string; eco: string };
  comments?: Map<string, string>;
}

export const MoveNotation = ({
  moves,
  branches = [],
  currentMoveIndex,
  currentBranchContext = null,
  onMoveClick,
  onBranchMoveClick,
  opening,
  comments = new Map(),
}: MoveNotationProps) => {
  const { moveRefs, scrollContainerRef } =
    useMoveNotationScroll(currentMoveIndex);
  const formattedMovePairs = useFormattedMovePairs(moves, branches);

  return (
    <div className="bg-card h-full rounded-lg p-2 sm:rounded-2xl sm:p-4 lg:p-6">
      <div className="mb-2 sm:mb-3 lg:mb-4">
        <h3 className="text-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm lg:text-lg">
          Opening
        </h3>
        {opening ? (
          <div className="mb-2 flex flex-wrap gap-1">
            <Badge variant="info" size="sm">
              {opening.name}
            </Badge>
            <Badge variant="outline" size="sm">
              {opening.eco}
            </Badge>
          </div>
        ) : (
          <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">
            Custom Position
          </p>
        )}
      </div>

      <div className="mb-2 sm:mb-3 lg:mb-4">
        <h3 className="text-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm lg:text-lg">
          Moves
        </h3>
        <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto">
          <div className="space-y-0.5 text-[10px] sm:space-y-1 sm:text-xs lg:text-sm">
            {formattedMovePairs.map((pair) => (
              <div key={pair.moveNumber} className="space-y-1">
                {/* Main line: move pair on its own line */}
                <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                  <span className="text-muted-foreground text-[10px] font-medium sm:text-xs lg:text-sm">
                    {pair.moveNumber}.
                  </span>
                  {pair.whiteMove && (
                    <MoveButton
                      move={pair.whiteMove.move}
                      index={pair.whiteMove.index}
                      isActive={pair.whiteMove.index === currentMoveIndex}
                      hasComment={hasComment(pair.whiteMove.index, comments)}
                      onClick={() => onMoveClick(pair.whiteMove!.index)}
                      onRef={(el) => {
                        if (el) {
                          moveRefs.current.set(pair.whiteMove!.index, el);
                        } else {
                          moveRefs.current.delete(pair.whiteMove!.index);
                        }
                      }}
                      size="md"
                    />
                  )}
                  {pair.blackMove && (
                    <>
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">
                        ...
                      </span>
                      <MoveButton
                        move={pair.blackMove.move}
                        index={pair.blackMove.index}
                        isActive={pair.blackMove.index === currentMoveIndex}
                        hasComment={hasComment(pair.blackMove.index, comments)}
                        onClick={() => onMoveClick(pair.blackMove!.index)}
                        onRef={(el) => {
                          if (el) {
                            moveRefs.current.set(pair.blackMove!.index, el);
                          } else {
                            moveRefs.current.delete(pair.blackMove!.index);
                          }
                        }}
                        size="md"
                      />
                    </>
                  )}
                </div>

                {/* Branches below the main line, indented */}
                {pair.branches.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {pair.branches.map((branch) => (
                      <BranchNotation
                        key={branch.id}
                        branch={branch}
                        branches={branches}
                        currentBranchContext={currentBranchContext}
                        onBranchMoveClick={onBranchMoveClick}
                        comments={comments}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
