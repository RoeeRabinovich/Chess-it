import { useMemo } from "react";
import type { MoveNode, MovePath } from "../../types/chess";
import { Badge } from "../ui/Badge";
import { useMoveNotationScroll } from "./useMoveNotationScroll";
import { MoveButton } from "./MoveButton";
import { pathToString } from "../../utils/moveTreeUtils";
import { getMainLineMoves } from "../../utils/moveTreeUtils";

interface TreeMoveNotationProps {
  moveTree: MoveNode[];
  currentPath: MovePath;
  onMoveClick: (path: MovePath) => void;
  opening?: { name: string; eco: string };
  comments?: Map<string, string>;
}

interface MovePair {
  moveNumber: number;
  whiteMove: { move: string; path: MovePath } | null;
  blackMove: { move: string; path: MovePath } | null;
  branches: Array<{
    path: MovePath;
    branchSequence: MoveNode[];
  }>;
}

/**
 * Recursively renders a branch sequence
 */
const BranchSequence = ({
  branchSequence,
  basePath,
  currentPath,
  onMoveClick,
  comments,
  depth = 0,
}: {
  branchSequence: MoveNode[];
  basePath: MovePath;
  currentPath: MovePath;
  onMoveClick: (path: MovePath) => void;
  comments: Map<string, string>;
  depth?: number;
}) => {
  if (branchSequence.length === 0) return null;

  // Calculate starting move number
  const mainIndex = basePath[0] ?? 0;
  const startMoveNumber = Math.floor(mainIndex / 2) + 1;
  const isWhiteStart = mainIndex % 2 === 0;

  return (
    <div className={`ml-${4 + depth * 4} space-y-1`}>
      {branchSequence.map((node, moveIdx) => {
        // Path format: [mainIndex, branchIndex, moveIndexInBranch]
        // basePath is [mainIndex, branchIndex], so we just add moveIdx
        const movePath: MovePath = [...basePath, moveIdx];
        // Calculate the actual move index: mainIndex is the move BEFORE the branch starts
        // So branch move 0 is at position mainIndex, branch move 1 is at mainIndex + 1, etc.
        const actualIndex = mainIndex + moveIdx;
        const isBlackMove = actualIndex % 2 === 1;
        const moveNumber = Math.floor(actualIndex / 2) + 1;
        const isActive = pathToString(movePath) === pathToString(currentPath);
        const hasComment = comments.has(pathToString(movePath));

        return (
          <div key={moveIdx} className="flex items-center gap-0.5 sm:gap-1">
            {moveIdx === 0 && isWhiteStart && (
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {startMoveNumber}.
              </span>
            )}
            {moveIdx === 0 && !isWhiteStart && (
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {startMoveNumber}...
              </span>
            )}
            {moveIdx > 0 && !isBlackMove && (
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {moveNumber}.
              </span>
            )}
            {moveIdx > 0 && isBlackMove && (
              <span className="text-muted-foreground text-[10px] sm:text-xs">
                ...
              </span>
            )}
            <MoveButton
              move={node.move.san}
              isActive={isActive}
              hasComment={hasComment}
              onClick={() => onMoveClick(movePath)}
              size="sm"
            />
            {/* Render nested branches */}
            {node.branches.length > 0 && (
              <div className="ml-4 space-y-1">
                {node.branches.map((nestedBranch, branchIdx) => {
                  // For nested branches, path is: [mainIndex, branchIndex, moveIndexInBranch, nestedBranchIndex]
                  const nestedBasePath: MovePath = [...movePath, branchIdx];
                  return (
                    <BranchSequence
                      key={branchIdx}
                      branchSequence={nestedBranch}
                      basePath={nestedBasePath}
                      currentPath={currentPath}
                      onMoveClick={onMoveClick}
                      comments={comments}
                      depth={depth + 1}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const TreeMoveNotation = ({
  moveTree,
  currentPath,
  onMoveClick,
  opening,
  comments = new Map(),
}: TreeMoveNotationProps) => {
  const mainLineMoves = getMainLineMoves(moveTree);
  const mainLineIndex = currentPath.length === 1 ? currentPath[0] : -1;

  const { moveRefs, scrollContainerRef } = useMoveNotationScroll(mainLineIndex);

  const formattedMovePairs = useMemo((): MovePair[] => {
    const pairs: MovePair[] = [];
    let currentMoveNumber = 1;

    for (let i = 0; i < mainLineMoves.length; i += 2) {
      const whiteMove = mainLineMoves[i];
      const blackMove = mainLineMoves[i + 1] || null;

      // Get branches from this main line position
      const mainNode = moveTree[i];
      const branches = mainNode
        ? mainNode.branches.map((branchSequence, branchIdx) => ({
            path: [i, branchIdx] as MovePath,
            branchSequence,
          }))
        : [];

      pairs.push({
        moveNumber: currentMoveNumber,
        whiteMove: whiteMove
          ? { move: whiteMove.san, path: [i] as MovePath }
          : null,
        blackMove: blackMove
          ? { move: blackMove.san, path: [i + 1] as MovePath }
          : null,
        branches,
      });

      currentMoveNumber++;
    }

    return pairs;
  }, [moveTree, mainLineMoves]);

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

                {/* Branches below the main line */}
                {pair.branches.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {pair.branches.map((branch, branchIdx) => (
                      <BranchSequence
                        key={branchIdx}
                        branchSequence={branch.branchSequence}
                        basePath={branch.path}
                        currentPath={currentPath}
                        onMoveClick={onMoveClick}
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
