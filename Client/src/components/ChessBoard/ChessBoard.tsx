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
  const containerRef = useRef<HTMLDivElement>(null);

  const [chessPosition, setChessPosition] = useState(position);
  const [boardSize, setBoardSize] = useState(() => {
    // Initialize size immediately based on window width
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // For mobile, use viewport-based sizing
      if (width < 640) {
        // Mobile: fit within viewport, accounting for padding and other sections
        const availableHeight = height - 200; // Account for nav, engine lines, eval bar, controls
        const availableWidth = width - 32; // Account for padding
        return Math.min(availableWidth, availableHeight, 350);
      } else if (width >= 1024) {
        return 550; // lg desktop
      } else if (width >= 768) {
        return 400; // md tablet - reduced from 500
      } else {
        // 640-768px range - make it smaller to fit better
        const availableHeight = height - 250; // Account for all sections
        const availableWidth = width - 64; // Account for padding
        return Math.min(availableWidth, availableHeight, 350);
      }
    }
    return 300; // default fallback
  });
  const [isMounted, setIsMounted] = useState(false);

  // Determine board size based on window width and height
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let newSize = 300;
      
      if (width < 640) {
        // Mobile: fit within viewport
        const availableHeight = height - 200;
        const availableWidth = width - 32;
        newSize = Math.min(availableWidth, availableHeight, 350);
      } else if (width >= 1024) {
        newSize = 550; // lg
      } else if (width >= 768) {
        newSize = 400; // md tablet - reduced from 500
      } else {
        // 640-768px range - make it smaller to fit better
        const availableHeight = height - 250;
        const availableWidth = width - 64;
        newSize = Math.min(availableWidth, availableHeight, 350);
      }
      
      setBoardSize(newSize);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Ensure container is mounted and has dimensions before rendering chessboard
  useEffect(() => {
    if (!containerRef.current) return;

    const checkReady = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setIsMounted(true);
        } else {
          // Retry after a short delay
          setTimeout(checkReady, 50);
        }
      }
    };

    // Use double RAF to ensure DOM is fully laid out
    requestAnimationFrame(() => {
      requestAnimationFrame(checkReady);
    });
  }, [boardSize]);

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
    <div
      ref={containerRef}
      style={{
        width: `${boardSize}px`,
        height: `${boardSize}px`,
        minWidth: `${boardSize}px`,
        minHeight: `${boardSize}px`,
        position: "relative",
        display: "block",
      }}
    >
      {isMounted ? (
        <Chessboard options={chessboardOptions as unknown as ChessBoardProps} />
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
          <div className="bg-muted border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default memo(ChessBoard);
export type { ChessBoardProps, MoveData } from "../../types/chess";
