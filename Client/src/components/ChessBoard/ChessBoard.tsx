import { useState, useRef, useMemo, useEffect, memo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { XCircle } from "lucide-react";
import { ChessBoardProps } from "../../types/chess";
import { useChessBoardOptions } from "./useChessBoardOptions";
import { useChessBoardInteractions } from "./useChessBoardInteractions";
import { useBoardSize } from "./useBoardSize";
import { useChessboardConfig } from "./useChessboardConfig";
import { mergeSquareStyles, calculateWrongMovePosition } from "./boardUtils";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const ChessBoard = ({
  position,
  onMove,
  isFlipped = false,
  isInteractive = true,
  boardScale = 1.0,
  showNotation = true,
  wrongMoveSquare,
}: ChessBoardProps) => {
  const chessGameRef = useRef(new Chess(position));
  const positionRef = useRef(position);
  const { boardSize, isMounted, containerRef } = useBoardSize();
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

  // Merge wrong move square styles with option squares
  const squareStyles = useMemo(
    () => mergeSquareStyles(optionSquares, wrongMoveSquare),
    [optionSquares, wrongMoveSquare],
  );

  // Memoize board options
  const chessboardOptions = useChessboardConfig({
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
  });

  // Calculate scaled board size - apply scale directly to dimensions
  const scaledBoardSize = boardSize * boardScale;

  return (
    <div
      ref={containerRef}
      style={{
        width: `${scaledBoardSize}px`,
        height: `${scaledBoardSize}px`,
        minWidth: `${scaledBoardSize}px`,
        minHeight: `${scaledBoardSize}px`,
        position: "relative",
        display: "block",
      }}
    >
      {isMounted ? (
        <>
          <Chessboard
            options={chessboardOptions as unknown as ChessBoardProps}
          />
          {/* Wrong move X icon overlay - positioned at top-right of the wrong square */}
          {wrongMoveSquare && (
            <div
              style={{
                position: "absolute",
                pointerEvents: "none",
                zIndex: 10,
                ...calculateWrongMovePosition(wrongMoveSquare),
              }}
            >
              <XCircle
                className="text-red-500 drop-shadow-lg"
                size={20}
                strokeWidth={2.5}
              />
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner size="large" />
        </div>
      )}
    </div>
  );
};

export default memo(ChessBoard);
export type { ChessBoardProps, MoveData } from "../../types/chess";
