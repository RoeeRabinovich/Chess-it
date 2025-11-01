import { useState, useCallback } from "react";
import { Chess, Square } from "chess.js";

interface UseChessBoardOptionsReturn {
  optionSquares: Record<string, React.CSSProperties>;
  getMoveOptions: (square: Square) => boolean;
  clearOptions: () => void;
}

export const useChessBoardOptions = (
  chessGameRef: React.RefObject<Chess>,
): UseChessBoardOptionsReturn => {
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});

  const getMoveOptions = useCallback(
    (square: Square): boolean => {
      const chess = chessGameRef.current;
      if (!chess) return false;

      const moves = chess.moves({ square, verbose: true });

      if (moves.length === 0) {
        setOptionSquares({});
        return false;
      }

      const newSquares: Record<string, React.CSSProperties> = {};

      for (const move of moves) {
        const targetPiece = chess.get(move.to);
        const sourcePiece = chess.get(square);
        const isCapture =
          targetPiece && targetPiece.color !== sourcePiece?.color;

        newSquares[move.to] = {
          background: isCapture
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      }

      newSquares[square] = {
        background: "rgba(255, 255, 0, 0.4)",
      };

      // Avoid redundant updates that cause extra renders
      setOptionSquares((current) => {
        let isSame = true;
        const currentKeys = Object.keys(current);
        const nextKeys = Object.keys(newSquares);
        if (currentKeys.length !== nextKeys.length) {
          isSame = false;
        } else {
          for (const key of nextKeys) {
            const a = newSquares[key]?.background;
            const b = current[key]?.background;
            if (a !== b) {
              isSame = false;
              break;
            }
          }
        }
        return isSame ? current : newSquares;
      });

      return true;
    },
    [chessGameRef],
  );

  const clearOptions = useCallback(() => {
    setOptionSquares({});
  }, []);

  return {
    optionSquares,
    getMoveOptions,
    clearOptions,
  };
};
