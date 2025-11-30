import { useMemo } from "react";
import { ChessMove, MoveBranch } from "../../types/chess";

export interface FormattedMovePair {
  moveNumber: number;
  whiteMove: { move: string; index: number } | null;
  blackMove: { move: string; index: number } | null;
  branches: Array<{
    id: string;
    moves: Array<{ move: string; index: number }>;
    startIndex: number;
  }>;
}

export const useFormattedMovePairs = (
  moves: ChessMove[],
  branches: MoveBranch[],
): FormattedMovePair[] => {
  return useMemo(() => {
    const pairs: FormattedMovePair[] = [];
    let currentMoveNumber = 1;

    for (let i = 0; i < moves.length; i += 2) {
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || null;

      // Find branches that start at this move index (white move) or the black move after it
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
};

