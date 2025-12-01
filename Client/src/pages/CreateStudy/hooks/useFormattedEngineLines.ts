import { useMemo } from "react";
import { Chess } from "chess.js";
import { convertUCIToSAN } from "../../../utils/chessNotation";

interface EngineLine {
  moves: string[];
  evaluation: number;
  depth: number;
  possibleMate?: string | null;
}

interface FormattedEngineLine {
  sanNotation: string;
  evaluation: number;
  depth: number;
  possibleMate: string | null;
}

interface UseFormattedEngineLinesParams {
  engineLines: EngineLine[];
  position: string;
}

export const useFormattedEngineLines = ({
  engineLines,
  position,
}: UseFormattedEngineLinesParams): FormattedEngineLine[] => {
  const formattedEngineLines = useMemo(() => {
    const chess = new Chess();
    try {
      chess.load(position);
    } catch {
      return engineLines.map((line) => ({
        sanNotation: convertUCIToSAN(line.moves, position),
        evaluation: line.evaluation,
        depth: line.depth,
        possibleMate: line.possibleMate ?? null,
      }));
    }
    const isBlackToMove = chess.turn() === "b";

    return engineLines.map((line) => {
      const normalizedEval = isBlackToMove ? -line.evaluation : line.evaluation;
      const normalizedMate = line.possibleMate
        ? isBlackToMove
          ? (-parseInt(line.possibleMate)).toString()
          : line.possibleMate
        : null;

      return {
        sanNotation: convertUCIToSAN(line.moves, position),
        evaluation: normalizedEval,
        depth: line.depth,
        possibleMate: normalizedMate,
      };
    });
  }, [engineLines, position]);

  return formattedEngineLines;
};
