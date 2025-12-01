import { useMemo } from "react";
import type { MoveNode, MovePath } from "../../types/chess";
import { getMainLineMoves } from "../../utils/moveTreeUtils";

export interface MovePair {
  moveNumber: number;
  whiteMove: { move: string; path: MovePath } | null;
  blackMove: { move: string; path: MovePath } | null;
  branches: Array<{
    path: MovePath;
    branchSequence: MoveNode[];
  }>;
}

export const useTreeFormattedMovePairs = (
  moveTree: MoveNode[],
): MovePair[] => {
  const mainLineMoves = getMainLineMoves(moveTree);

  return useMemo((): MovePair[] => {
    const pairs: MovePair[] = [];
    let currentMoveNumber = 1;

    for (let i = 0; i < mainLineMoves.length; i += 2) {
      const whiteMove = mainLineMoves[i];
      const blackMove = mainLineMoves[i + 1] || null;

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
};

