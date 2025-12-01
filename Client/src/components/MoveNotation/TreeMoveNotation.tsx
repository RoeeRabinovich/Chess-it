import type { MoveNode, MovePath } from "../../types/chess";
import { useMoveNotationScroll } from "./useMoveNotationScroll";
import { MoveButton } from "./MoveButton";
import { pathToString } from "../../utils/moveTreeUtils";
import { BranchSequence } from "./BranchSequence";
import { useTreeFormattedMovePairs } from "./useTreeFormattedMovePairs";
import { OpeningSection } from "./OpeningSection";

interface TreeMoveNotationProps {
  moveTree: MoveNode[];
  currentPath: MovePath;
  onMoveClick: (path: MovePath) => void;
  opening?: { name: string; eco: string };
  comments?: Map<string, string>;
}

export const TreeMoveNotation = ({
  moveTree,
  currentPath,
  onMoveClick,
  opening,
  comments = new Map(),
}: TreeMoveNotationProps) => {
  const mainLineIndex = currentPath.length === 1 ? currentPath[0] : -1;

  const { moveRefs, scrollContainerRef } = useMoveNotationScroll(mainLineIndex);
  const formattedMovePairs = useTreeFormattedMovePairs(moveTree);

  return (
    <div className="bg-card h-full rounded-lg p-2 sm:rounded-2xl sm:p-4 lg:p-6">
      <OpeningSection opening={opening} />

      <div className="mb-2 sm:mb-3 lg:mb-4">
        <h3 className="text-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm lg:text-lg">
          Moves
        </h3>
        <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto">
          <div className="space-y-0.5 text-[10px] sm:space-y-1 sm:text-xs lg:text-sm">
            {formattedMovePairs.map((pair) => (
              <div key={pair.moveNumber} className="space-y-1">
                {/* Main line: move pair */}
                <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                  <span className="text-muted-foreground text-[10px] font-medium sm:text-xs lg:text-sm">
                    {pair.moveNumber}.
                  </span>
                  {pair.whiteMove && (
                    <MoveButton
                      move={pair.whiteMove.move}
                      isActive={
                        pathToString(pair.whiteMove.path) ===
                        pathToString(currentPath)
                      }
                      hasComment={comments.has(
                        pathToString(pair.whiteMove.path),
                      )}
                      onClick={() => onMoveClick(pair.whiteMove!.path)}
                      onRef={(el) => {
                        if (el) {
                          moveRefs.current.set(pair.whiteMove!.path[0], el);
                        } else {
                          moveRefs.current.delete(pair.whiteMove!.path[0]);
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
                        isActive={
                          pathToString(pair.blackMove.path) ===
                          pathToString(currentPath)
                        }
                        hasComment={comments.has(
                          pathToString(pair.blackMove.path),
                        )}
                        onClick={() => onMoveClick(pair.blackMove!.path)}
                        onRef={(el) => {
                          if (el) {
                            moveRefs.current.set(pair.blackMove!.path[0], el);
                          } else {
                            moveRefs.current.delete(pair.blackMove!.path[0]);
                          }
                        }}
                        size="md"
                      />
                    </>
                  )}
                </div>

                {/* Branches below the main line - displayed inline */}
                {pair.branches.length > 0 && (
                  <div className="ml-4 flex flex-wrap items-center gap-0.5 sm:gap-1">
                    {pair.branches.map((branch, branchIdx) => (
                      <BranchSequence
                        key={branchIdx}
                        branchSequence={branch.branchSequence}
                        basePath={branch.path}
                        currentPath={currentPath}
                        onMoveClick={onMoveClick}
                        comments={comments}
                        moveTree={moveTree}
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
