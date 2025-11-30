import { MoveBranch, BranchContext } from "../../types/chess";
import { Comment } from "../icons/Comment.icon";
import { hasBranchComment } from "./moveNotationUtils";

interface BranchNotationProps {
  branch: {
    id: string;
    moves: Array<{ move: string; index: number }>;
    startIndex: number;
  };
  branches: MoveBranch[];
  currentBranchContext?: BranchContext | null;
  onBranchMoveClick?: (branchId: string, moveIndexInBranch: number) => void;
  comments: Map<string, string>;
}

export const BranchNotation = ({
  branch,
  branches,
  currentBranchContext,
  onBranchMoveClick,
  comments,
}: BranchNotationProps) => {
  // Find branches that continue from the end of this branch
  const branchBranches = branches.filter(
    (b) => b.startIndex === branch.startIndex + branch.moves.length,
  );

  // Determine if branch starts with white or black move
  const actualStartIndex = Number(branch.startIndex);
  const actualStartIsWhite = actualStartIndex % 2 === 0;
  const actualStartMoveNumber = Math.floor(actualStartIndex / 2) + 1;

  return (
    <div key={branch.id}>
      <div className="flex flex-wrap items-center gap-1">
        {/* Branch start: move number with ellipsis */}
        <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
          {actualStartIsWhite ? (
            <>{actualStartMoveNumber}.</>
          ) : (
            <>{actualStartMoveNumber}...</>
          )}
        </span>

        {/* Branch moves */}
        {branch.moves.map((branchMove, moveIdx) => {
          const branchStartIdx = Number(branch.startIndex);
          const actualIndex = branchStartIdx + moveIdx;
          const isBlackMove = actualIndex % 2 === 1;
          const isWhiteMove = !isBlackMove;
          const moveNumber = Math.floor(actualIndex / 2) + 1;
          const isActiveBranchMove =
            currentBranchContext?.branchId === branch.id &&
            currentBranchContext?.moveIndexInBranch === moveIdx;

          return (
            <div key={moveIdx} className="flex items-center gap-0.5 sm:gap-1">
              {moveIdx === 0 ? (
                // First move: prefix already shown above
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => onBranchMoveClick?.(branch.id, moveIdx)}
                    className={`rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs ${
                      isActiveBranchMove
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {branchMove.move}
                  </button>
                  {hasBranchComment(branch.id, moveIdx, comments) && (
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
                    <span className="text-muted-foreground text-[10px] sm:text-xs">
                      ...
                    </span>
                  )}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onBranchMoveClick?.(branch.id, moveIdx)}
                      className={`rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs ${
                        isActiveBranchMove
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {branchMove.move}
                    </button>
                    {hasBranchComment(branch.id, moveIdx, comments) && (
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
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              (
            </span>
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
                    const isActiveNested =
                      currentBranchContext?.branchId === nestedBranch.id &&
                      currentBranchContext?.moveIndexInBranch === idx;

                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-0.5 sm:gap-1"
                      >
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
                            className={`rounded px-1 py-0.5 text-[10px] transition-colors sm:px-1.5 sm:text-xs ${
                              isActiveNested
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {bm.san}
                          </button>
                          {hasBranchComment(nestedBranch.id, idx, comments) && (
                            <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
                          )}
                        </div>
                      </span>
                    );
                  })}
                  {nestedIdx < branchBranches.length - 1 && (
                    <span className="text-muted-foreground text-[10px] sm:text-xs">
                      ;
                    </span>
                  )}
                </div>
              );
            })}
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              )
            </span>
          </>
        )}
      </div>
    </div>
  );
};

