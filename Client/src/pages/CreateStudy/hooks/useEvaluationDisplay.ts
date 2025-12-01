import { useMemo, useRef } from "react";
import { Chess } from "chess.js";

interface UseEvaluationDisplayParams {
  gameState: { position: string };
  isEngineEnabled: boolean;
  depth: number;
  positionEvaluation: number;
  possibleMate: string | null;
  evaluationPosition: string;
}

interface EvaluationDisplay {
  evaluation: number;
  possibleMate: string | null;
}

export const useEvaluationDisplay = ({
  gameState,
  isEngineEnabled,
  depth,
  positionEvaluation,
  possibleMate,
  evaluationPosition,
}: UseEvaluationDisplayParams): EvaluationDisplay => {
  const positionEvalCache = useRef<
    Map<string, { evaluation: number; possibleMate: string | null }>
  >(new Map());

  const lastDisplayedEvalRef = useRef<{
    evaluation: number;
    possibleMate: string | null;
  } | null>(null);

  const displayEvaluation = useMemo(() => {
    const chess = new Chess();
    try {
      chess.load(gameState.position);
    } catch {
      return (
        lastDisplayedEvalRef.current || { evaluation: 0, possibleMate: null }
      );
    }
    const isBlackToMove = chess.turn() === "b";

    const normalizeEval = (evaluation: number) =>
      isBlackToMove ? -evaluation : evaluation;
    const normalizeMate = (mate: string | null) => {
      if (!mate) return null;
      const mateNum = parseInt(mate);
      return isBlackToMove ? (-mateNum).toString() : mate;
    };

    if (
      depth > 0 &&
      isEngineEnabled &&
      evaluationPosition === gameState.position
    ) {
      positionEvalCache.current.set(gameState.position, {
        evaluation: positionEvaluation,
        possibleMate: possibleMate || null,
      });

      const normalizedEval = normalizeEval(positionEvaluation);
      const normalizedMate = normalizeMate(possibleMate || null);
      lastDisplayedEvalRef.current = {
        evaluation: normalizedEval,
        possibleMate: normalizedMate,
      };

      return {
        evaluation: normalizedEval,
        possibleMate: normalizedMate,
      };
    }

    if (isEngineEnabled) {
      const cached = positionEvalCache.current.get(gameState.position);
      if (cached && (cached.evaluation !== 0 || cached.possibleMate)) {
        const normalizedEval = normalizeEval(cached.evaluation);
        const normalizedMate = normalizeMate(cached.possibleMate);
        lastDisplayedEvalRef.current = {
          evaluation: normalizedEval,
          possibleMate: normalizedMate,
        };
        return {
          evaluation: normalizedEval,
          possibleMate: normalizedMate,
        };
      }
    }

    if (lastDisplayedEvalRef.current) {
      return lastDisplayedEvalRef.current;
    }

    return { evaluation: 0, possibleMate: null };
  }, [
    depth,
    positionEvaluation,
    possibleMate,
    isEngineEnabled,
    gameState.position,
    evaluationPosition,
  ]);

  return displayEvaluation;
};
