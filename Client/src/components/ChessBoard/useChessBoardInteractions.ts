import { useCallback, useState } from "react";
import { Chess, Square } from "chess.js";
import { PieceDropArgs, MoveData } from "../../types/chess";

interface UseChessBoardInteractionsParams {
  chessGameRef: React.RefObject<Chess>;
  isInteractive: boolean;
  onMove?: (move: MoveData) => boolean | void;
  setChessPosition: (position: string) => void;
  getMoveOptions: (square: Square) => boolean;
  clearOptions: () => void;
}

interface UseChessBoardInteractionsReturn {
  moveFrom: string;
  handleClickToMove: (square: Square) => void;
  onSquareClick: ({ square }: { square: string }) => void;
  onPieceClick: ({ square }: { square: string }) => void;
  onPieceDrop: (args: PieceDropArgs) => boolean;
  onPieceDrag: (args: {
    square: string;
    piece?: unknown;
    isSparePiece?: boolean;
  }) => void;
  clearSelection: () => void;
}

export const useChessBoardInteractions = ({
  chessGameRef,
  isInteractive,
  onMove,
  setChessPosition,
  getMoveOptions,
  clearOptions,
}: UseChessBoardInteractionsParams): UseChessBoardInteractionsReturn => {
  const [moveFrom, setMoveFrom] = useState("");

  const handleClickToMove = useCallback(
    (square: Square) => {
      if (!isInteractive) return;

      const chess = chessGameRef.current;
      if (!chess) return;

      const clickedPiece = chess.get(square as Square);
      const turnColor = chess.turn();

      // --- Case 1: No piece selected yet ---
      if (!moveFrom) {
        // Must click your own piece
        if (!clickedPiece || clickedPiece.color !== turnColor) return;

        // Highlight possible moves
        if (getMoveOptions(square as Square)) {
          setMoveFrom(square);
        }
        return;
      }

      // --- Case 2: Clicking same square again → deselect ---
      if (moveFrom === square) {
        setMoveFrom("");
        clearOptions();
        return;
      }

      // --- Case 3: Try to move or capture ---
      const possibleMoves = chess.moves({
        square: moveFrom as Square,
        verbose: true,
      });

      const foundMove = possibleMoves.find(
        (m) => m.from === moveFrom && m.to === square,
      );

      if (foundMove) {
        try {
          const move = chess.move({
            from: moveFrom,
            to: square,
            promotion: "q",
          });

          const shouldCommit = onMove?.(move) ?? true;
          if (shouldCommit === false) {
            chess.undo();
            return;
          }

          setChessPosition(chess.fen());
          setMoveFrom("");
          clearOptions();
        } catch (error) {
          console.error("Invalid move:", error);
        }
        return;
      }

      // --- Case 4: Clicked another of your own pieces instead ---
      if (clickedPiece && clickedPiece.color === turnColor) {
        if (getMoveOptions(square as Square)) {
          setMoveFrom(square);
        }
        return;
      }

      // --- Case 5: Clicked empty / invalid square ---
      setMoveFrom("");
      clearOptions();
    },
    [
      isInteractive,
      moveFrom,
      getMoveOptions,
      onMove,
      chessGameRef,
      setChessPosition,
      clearOptions,
    ],
  );

  // Handle square clicks
  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      handleClickToMove(square as Square);
    },
    [handleClickToMove],
  );

  const onPieceClick = useCallback(
    ({ square }: { square: string }) => {
      handleClickToMove(square as Square);
    },
    [handleClickToMove],
  );

  // Handle piece drops for drag-and-drop
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropArgs): boolean => {
      if (!isInteractive || !targetSquare) {
        return false;
      }

      const chess = chessGameRef.current;
      if (!chess) return false;

      // Treat press+release on the same square as a click-to-select when dragActivationDistance is 0
      if (sourceSquare === targetSquare) {
        setMoveFrom(sourceSquare);
        getMoveOptions(sourceSquare as Square);
        return false; // no move; snap piece back
      }

      try {
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        // Check with parent if move should be committed
        const shouldCommit = onMove?.(move) ?? true;

        if (shouldCommit === false) {
          chess.undo();
          return false;
        }

        setChessPosition(chess.fen());
        setMoveFrom("");
        clearOptions();

        return true;
      } catch {
        return false;
      }
    },
    [
      isInteractive,
      onMove,
      getMoveOptions,
      chessGameRef,
      setChessPosition,
      clearOptions,
    ],
  );

  // On drag start: treat as selection and show legal moves immediately
  const onPieceDrag = useCallback(
    ({
      square,
    }: {
      square: string;
      piece?: unknown;
      isSparePiece?: boolean;
    }) => {
      if (!isInteractive) return;

      setMoveFrom(square);
      getMoveOptions(square as Square);
    },
    [isInteractive, getMoveOptions],
  );

  const clearSelection = useCallback(() => {
    setMoveFrom("");
    clearOptions();
  }, [clearOptions]);

  return {
    moveFrom,
    handleClickToMove,
    onSquareClick,
    onPieceClick,
    onPieceDrop,
    onPieceDrag,
    clearSelection,
  };
};
