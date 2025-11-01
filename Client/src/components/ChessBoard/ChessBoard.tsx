import { useState, useRef, useMemo, useEffect, memo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { ChessBoardProps } from "../../types/chess";
import { useChessBoardOptions } from "./useChessBoardOptions";
import { useChessBoardInteractions } from "./useChessBoardInteractions";
import {
  BOARD_STYLE,
  DARK_SQUARE_STYLE,
  LIGHT_SQUARE_STYLE,
  ANIMATION_DURATION_MS,
} from "./boardStyles";

const ChessBoard = ({
  position,
  onMove,
  isFlipped = false,
  isInteractive = true,
}: ChessBoardProps) => {
  const chessGameRef = useRef(new Chess(position));
  const positionRef = useRef(position);

  const [chessPosition, setChessPosition] = useState(position);

  const { optionSquares, getMoveOptions, clearOptions } =
    useChessBoardOptions(chessGameRef);

  const {
    onSquareClick,
    onPieceClick,
    onPieceDrop,
    onPieceDrag,
    clearSelection,
  } = useChessBoardInteractions({
    chessGameRef,
    isInteractive,
    onMove,
    setChessPosition,
    getMoveOptions,
    clearOptions,
  });

  // Update chess game when position prop changes
  useEffect(() => {
    if (position !== positionRef.current) {
      positionRef.current = position;
      try {
        chessGameRef.current.load(position);
        setChessPosition(chessGameRef.current.fen());
        clearSelection();
      } catch (error) {
        console.error("Invalid FEN position:", error);
      }
    }
  }, [position, clearSelection]);

  // Memoize board options
  const chessboardOptions = useMemo(
    () => ({
      onSquareClick,
      onPieceDrop,
      onPieceClick,
      onPieceDrag,
      position: chessPosition,
      boardOrientation: (isFlipped ? "black" : "white") as "white" | "black",
      squareStyles: optionSquares,
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
    }),
    [
      onSquareClick,
      onPieceClick,
      onPieceDrop,
      onPieceDrag,
      chessPosition,
      isFlipped,
      optionSquares,
      isInteractive,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-lg">
      <Chessboard options={chessboardOptions as unknown as ChessBoardProps} />
    </div>
  );
};

export default memo(ChessBoard);
export type { ChessBoardProps, MoveData } from "../../types/chess";
