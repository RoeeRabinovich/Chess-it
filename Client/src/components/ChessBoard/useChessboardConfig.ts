import { useMemo } from "react";
import { Chess, Square } from "chess.js";
import {
  BOARD_STYLE,
  DARK_SQUARE_STYLE,
  LIGHT_SQUARE_STYLE,
  ANIMATION_DURATION_MS,
} from "./boardStyles";

interface UseChessboardConfigParams {
  onSquareClick: ({ square }: { square: string }) => void;
  onPieceDrop: (args: {
    sourceSquare: string;
    targetSquare: string | null;
  }) => boolean;
  onPieceClick: ({ square }: { square: string }) => void;
  onPieceDrag: (args: {
    square: string;
    piece?: unknown;
    isSparePiece?: boolean;
  }) => void;
  chessPosition: string;
  isFlipped: boolean;
  squareStyles: Record<string, React.CSSProperties>;
  isInteractive: boolean;
  showNotation: boolean;
  chessGameRef: React.RefObject<Chess>;
}

export const useChessboardConfig = ({
  onSquareClick,
  onPieceDrop,
  onPieceClick,
  onPieceDrag,
  chessPosition,
  isFlipped,
  squareStyles,
  isInteractive,
  showNotation,
  chessGameRef,
}: UseChessboardConfigParams) => {
  const chessboardOptions = useMemo(
    () => ({
      onSquareClick,
      onPieceDrop,
      onPieceClick,
      onPieceDrag,
      position: chessPosition,
      boardOrientation: (isFlipped ? "black" : "white") as "white" | "black",
      squareStyles: squareStyles,
      allowDragging: isInteractive,
      canDragPiece: ({
        piece,
        square,
      }: {
        piece?: string;
        square: string;
        isSparePiece?: boolean;
      }) => {
        if (!isInteractive) return false;
        const chess = chessGameRef.current;
        if (!chess) return false;

        // If no piece, can't drag
        if (!piece) return false;

        // Get piece from chess.js to verify it's your piece
        const chessPiece = chess.get(square as Square);
        if (!chessPiece) return false;

        // Only allow dragging your own pieces
        const turnColor = chess.turn();
        return chessPiece.color === turnColor;
      },
      dragActivationDistance: 0,
      boardStyle: BOARD_STYLE,
      darkSquareStyle: DARK_SQUARE_STYLE,
      lightSquareStyle: LIGHT_SQUARE_STYLE,
      animationDurationInMs: ANIMATION_DURATION_MS,
      showNotation: showNotation,
    }),
    [
      onSquareClick,
      onPieceClick,
      onPieceDrop,
      onPieceDrag,
      chessPosition,
      isFlipped,
      squareStyles,
      isInteractive,
      showNotation,
      chessGameRef,
    ],
  );

  return chessboardOptions;
};

