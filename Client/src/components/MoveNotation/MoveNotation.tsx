import { useMemo, useEffect, useRef } from "react";
import { ChessMove, MoveBranch } from "../../types/chess";
import { Comment } from "../icons/Comment.icon";
import { Badge } from "../ui/Badge";

interface MoveNotationProps {
  moves: ChessMove[];
  branches?: MoveBranch[];
  currentMoveIndex: number;
  onMoveClick: (moveIndex: number) => void;
  onBranchMoveClick?: (branchId: string, moveIndexInBranch: number) => void;
  opening?: { name: string; eco: string };
  comments?: Map<string, string>;
}

export const MoveNotation = ({
  moves,
  branches = [],
  currentMoveIndex,
  onMoveClick,
  onBranchMoveClick,
  opening,
  comments = new Map(),
}: MoveNotationProps) => {
  // Helper function to check if a main line move has a comment
  const hasComment = (moveIndex: number): boolean => {
    const commentKey = `main-${moveIndex}`;
    return comments.has(commentKey) && comments.get(commentKey)?.trim() !== "";
  };

  // Helper function to check if a branch move has a comment
  const hasBranchComment = (branchId: string, moveIndexInBranch: number): boolean => {
    const commentKey = `branch-${branchId}-${moveIndexInBranch}`;
    return comments.has(commentKey) && comments.get(commentKey)?.trim() !== "";
  };
  // Ref to store move button refs for scrolling
  const moveRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const branchMoveRefs = useRef<Map<string, Map<number, HTMLButtonElement>>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to active move when currentMoveIndex changes
  useEffect(() => {
    // If at starting position (index -1), scroll to top
    if (currentMoveIndex === -1 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // For main line moves
    const activeMoveButton = moveRefs.current.get(currentMoveIndex);
    if (activeMoveButton && scrollContainerRef.current) {
      activeMoveButton.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentMoveIndex]);

  const formattedMovePairs = useMemo(() => {
    // Group moves into pairs (white + black)
    const pairs: Array<{
      moveNumber: number;
      whiteMove: { move: string; index: number } | null;
      blackMove: { move: string; index: number } | null;
      branches: Array<{
        id: string;
        moves: Array<{ move: string; index: number }>;
        startIndex: number;
      }>;
    }> = [];

    let currentMoveNumber = 1;

    for (let i = 0; i < moves.length; i += 2) {
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || null;

      // Find branches that start at this move index (white move) or the black move after it
      // A branch at index i is an alternative white move, a branch at i+1 is an alternative black move
      const branchesAtThisPair = branches.filter(
        (b) => b.startIndex === i || b.startIndex === i + 1,
      );

      pairs.push({
        moveNumber: currentMoveNumber,
        whiteMove: whiteMove ? { move: whiteMove.san, index: i } : null,
        blackMove: blackMove ? { move: blackMove.san, index: i + 1 } : null,
        branches: branchesAtThisPair.map((branch) => ({
          id: branch.id,
          moves: branch.moves.map((bm, idx) => ({
            move: bm.san,
            index: idx,
          })),
          startIndex: branch.startIndex,
        })),
      });

      currentMoveNumber++;
    }

    return pairs;
  }, [moves, branches]);

  // Helper function to render a branch with nested branches
  const renderBranch = (
    branch: {
      id: string;
      moves: Array<{ move: string; index: number }>;
      startIndex: number;
    },
    _startMoveNumber: number,
    _startIsWhite: boolean,
    depth: number = 0,
  ) => {
    // Find branches that continue from the end of this branch
    const branchBranches = branches.filter(
      (b) => b.startIndex === branch.startIndex + branch.moves.length,
    );

    // Determine if branch starts with white or black move
    // White moves are at even indices (0, 2, 4...) → show "moveNumber."
    // Black moves are at odd indices (1, 3, 5...) → show "moveNumber..."
    const actualStartIndex = Number(branch.startIndex);
    const actualStartIsWhite = actualStartIndex % 2 === 0;
    const actualStartMoveNumber = Math.floor(actualStartIndex / 2) + 1;

    return (
      <div key={branch.id} className={depth > 0 ? "" : ""}>
        <div className="flex flex-wrap items-center gap-1">
          {/* Branch start: move number with ellipsis */}
          <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
            {actualStartIsWhite ? (
              <>{actualStartMoveNumber}.</>
            ) : (
              <>{actualStartMoveNumber}...</>
            )}
          </span>

          {/* Branch moves - simple notation: white gets moveNumber., black gets ... */}
          {branch.moves.map((branchMove, moveIdx) => {
            const branchStartIdx = Number(branch.startIndex);
            const actualIndex = branchStartIdx + moveIdx;
            const isBlackMove = actualIndex % 2 === 1;
            const isWhiteMove = !isBlackMove;
            const moveNumber = Math.floor(actualIndex / 2) + 1;

            return (
              <div key={moveIdx} className="flex items-center gap-0.5 sm:gap-1">
                {/* First move already has prefix (1. or 1...), subsequent moves need their own */}
                {moveIdx === 0 ? (
                  // First move: prefix already shown above, just show the move
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onBranchMoveClick?.(branch.id, moveIdx)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs"
                    >
                      {branchMove.move}
                    </button>
                    {hasBranchComment(branch.id, moveIdx) && (
                      <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
                    )}
                  </div>
                ) : (
                  // Subsequent moves: white gets moveNumber., black gets ...
                  <>
                    {isWhiteMove && (
                      <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                        {moveNumber}.
                      </span>
                    )}
                    {isBlackMove && (
                      <span className="text-muted-foreground text-[10px] sm:text-xs">...</span>
                    )}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onBranchMoveClick?.(branch.id, moveIdx)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs"
                      >
                        {branchMove.move}
                      </button>
                      {hasBranchComment(branch.id, moveIdx) && (
                        <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Nested branches in parentheses on same line */}
          {branchBranches.length > 0 && (
            <>
              <span className="text-muted-foreground text-[10px] sm:text-xs">(</span>
              {branchBranches.map((nestedBranch, nestedIdx) => {
                const nestedMoveNumber =
                  Math.floor(nestedBranch.startIndex / 2) + 1;
                const nestedIsWhite = nestedBranch.startIndex % 2 === 0;

                return (
                  <div
                    key={nestedBranch.id}
                    className="inline-flex flex-wrap items-center gap-0.5 sm:gap-1"
                  >
                    <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                      {nestedIsWhite ? (
                        <>{nestedMoveNumber}.</>
                      ) : (
                        <>{nestedMoveNumber}...</>
                      )}
                    </span>
                    {nestedBranch.moves.map((bm, idx) => {
                      const nestedActualIndex = nestedBranch.startIndex + idx;
                      const isBlackMove = nestedActualIndex % 2 === 1;
                      const isWhiteMove = !isBlackMove;
                      const nestedMoveNumber =
                        Math.floor(nestedActualIndex / 2) + 1;

                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-0.5 sm:gap-1"
                        >
                          {/* First move already has prefix, subsequent moves need their own */}
                          {idx > 0 && isWhiteMove && (
                            <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                              {nestedMoveNumber}.
                            </span>
                          )}
                          {idx > 0 && isBlackMove && (
                            <span className="text-muted-foreground text-[10px] sm:text-xs">
                              ...
                            </span>
                          )}
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() =>
                                onBranchMoveClick?.(nestedBranch.id, idx)
                              }
                              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs"
                            >
                              {bm.san}
                            </button>
                            {hasBranchComment(nestedBranch.id, idx) && (
                              <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
                            )}
                          </div>
                        </span>
                      );
                    })}
                    {nestedIdx < branchBranches.length - 1 && (
                      <span className="text-muted-foreground text-[10px] sm:text-xs">;</span>
                    )}
                  </div>
                );
              })}
              <span className="text-muted-foreground text-[10px] sm:text-xs">)</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card h-full rounded-lg p-2 sm:rounded-2xl sm:p-4 lg:p-6">
      <div className="mb-2 sm:mb-3 lg:mb-4">
        <h3 className="text-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm lg:text-lg">Opening</h3>
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
          <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">Custom Position</p>
        )}
      </div>

      <div className="mb-2 sm:mb-3 lg:mb-4">
        <h3 className="text-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm lg:text-lg">Moves</h3>
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
                    <div className="flex items-center gap-0.5">
                      <button
                        ref={(el) => {
                          if (el) {
                            moveRefs.current.set(pair.whiteMove!.index, el);
                          } else {
                            moveRefs.current.delete(pair.whiteMove!.index);
                          }
                        }}
                        onClick={() => onMoveClick(pair.whiteMove!.index)}
                        className={`rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs lg:px-2 lg:text-sm ${
                          pair.whiteMove.index === currentMoveIndex
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {pair.whiteMove.move}
                      </button>
                      {hasComment(pair.whiteMove.index) && (
                        <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
                      )}
                    </div>
                  )}
                  {pair.blackMove && (
                    <>
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">...</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          ref={(el) => {
                            if (el) {
                              moveRefs.current.set(pair.blackMove!.index, el);
                            } else {
                              moveRefs.current.delete(pair.blackMove!.index);
                            }
                          }}
                          onClick={() => onMoveClick(pair.blackMove!.index)}
                          className={`rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs lg:px-2 lg:text-sm ${
                            pair.blackMove.index === currentMoveIndex
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {pair.blackMove.move}
                        </button>
                        {hasComment(pair.blackMove.index) && (
                          <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Branches below the main line, indented */}
                {pair.branches.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {pair.branches.map((branch) => {
                      // Calculate the correct move number and color for the branch start
                      // If branch starts at index 0, it's white move 1: 1.
                      // If branch starts at index 1, it's black move 1: 1...
                      // If branch starts at index 2, it's white move 2: 2.
                      // If branch starts at index 3, it's black move 2: 2...
                      const branchStartIndex = Number(branch.startIndex);
                      const branchStartMoveNumber =
                        Math.floor(branchStartIndex / 2) + 1;
                      const branchStartIsWhite = branchStartIndex % 2 === 0;

                      return renderBranch(
                        branch,
                        branchStartMoveNumber,
                        branchStartIsWhite,
                        0,
                      );
                    })}
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
