import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Chessboard, ChessboardOptions } from "react-chessboard";
import { Chess, Square } from "chess.js";

export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

export interface EngineLine {
  moves: string[];
  evaluation: number;
}

export interface ChessBoardProps {
  /** FEN position to display */
  position: string;
  /** Called when a valid move is made — return false to revert */
  onMove?: (move: MoveData) => boolean | void;
  /** Called when an invalid move is attempted */
  onInvalidMove?: (from: string, to: string) => void;
  /** Flip the board to view from black's perspective */
  isFlipped?: boolean;
  /** Optional arrows (e.g., engine lines or highlights) */
  engineLines?: EngineLine[];
  /** Allow or disallow user moves */
  isInteractive?: boolean;
}

/**
 * Generates highlight styles for legal moves from a given square.
 * - Yellow highlight on the selected square
 * - Green radial gradient on regular move targets
 * - Red radial gradient on capture targets
 */
const getHighlightStyles = (
  chess: Chess,
  square: string,
): Record<string, React.CSSProperties> => {
  const moves = chess.moves({ square: square as Square, verbose: true });
  if (moves.length === 0) return {};

  const highlights: Record<string, React.CSSProperties> = {};

  for (const move of moves) {
    const targetPiece = chess.get(move.to as Square);
    const sourcePiece = chess.get(square as Square);
    const isCapture = targetPiece && targetPiece.color !== sourcePiece?.color;

    highlights[move.to] = {
      background: isCapture
        ? "radial-gradient(circle, rgba(255, 0, 0, 0.3) 80%, transparent 85%)"
        : "radial-gradient(circle, rgba(16, 185, 129, 0.2) 25%, transparent 25%)",
      borderRadius: "50%",
    };
  }

  // Highlight the selected square in yellow
  highlights[square] = {
    background: "rgba(255, 255, 0, 0.4)",
  };

  return highlights;
};

/**
 * ChessBoard Component
 *
 * A fully-featured chess board with:
 * - Click-to-move and drag-and-drop support
 * - Visual move indicators and engine line arrows
 * - Proper state synchronization and error handling
 * - Full TypeScript support with no `any` types
 */
export default function ChessBoard({
  position,
  onMove,
  onInvalidMove,
  isFlipped = false,
  engineLines = [],
  isInteractive = true,
}: ChessBoardProps) {
  // Maintain a single Chess instance across renders
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  // Local state for board rendering and interaction
  const [fen, setFen] = useState(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [highlightSquares, setHighlightSquares] = useState<
    Record<string, React.CSSProperties>
  >({});

  /**
   * Sync internal position with the position prop.
   * Only reloads if the position actually differs to prevent flickering.
   */
  useEffect(() => {
    if (position !== fen) {
      try {
        chess.load(position);
        setFen(chess.fen());
        setSelectedSquare("");
        setHighlightSquares({});
      } catch (error) {
        console.error("Invalid FEN position:", error);
      }
    }
  }, [position, fen, chess]);

  /**
   * Highlight legal moves for a selected square.
   * Returns true if there are legal moves, false otherwise.
   */
  const highlightMoves = useCallback(
    (square: string): boolean => {
      const highlights = getHighlightStyles(chess, square);
      setHighlightSquares(highlights);
      return Object.keys(highlights).length > 1;
    },
    [chess],
  );

  /**
   * Execute a move on the board.
   * Updates FEN, calls onMove callback, and handles reversions.
   */
  const executeMove = useCallback(
    (move: MoveData): boolean => {
      try {
        const result = chess.move(move);

        if (!result) {
          onInvalidMove?.(move.from, move.to);
          return false;
        }

        // Ask parent if they want to commit this move
        const shouldCommit = onMove?.(move) ?? true;

        if (shouldCommit === false) {
          chess.undo();
          return false;
        }

        // Update local FEN and clear selection
        setFen(chess.fen());
        setSelectedSquare("");
        setHighlightSquares({});
        return true;
      } catch (error) {
        console.error("Move execution error:", error);
        onInvalidMove?.(move.from, move.to);
        return false;
      }
    },
    [chess, onMove, onInvalidMove],
  );

  /**
   * Handle square clicks for click-to-move.
   * - First click: select a piece and show legal moves
   * - Second click: move piece if target is legal
   */
  const handleSquareClick = useCallback(
    ({ square, piece }: { piece: string; square: string }): void => {
      if (!isInteractive) return;

      // If no square selected and clicking on a piece, select it
      if (!selectedSquare && piece) {
        const hasMoves = highlightMoves(square);
        if (hasMoves) {
          setSelectedSquare(square);
        }
        return;
      }

      // Get possible moves from the selected square
      const possibleMoves = chess
        .moves({ square: selectedSquare as Square, verbose: true })
        .map((m) => m.to);

      // If clicked square is not a legal move target
      if (!possibleMoves.includes(square as Square)) {
        // Check if this square has a piece with legal moves
        const hasMoves = highlightMoves(square);
        setSelectedSquare(hasMoves ? square : "");
        return;
      }

      // Execute the move
      const move: MoveData = {
        from: selectedSquare,
        to: square,
        promotion: "q", // Default to queen promotion
      };

      executeMove(move);
    },
    [selectedSquare, chess, highlightMoves, isInteractive, executeMove],
  );

  /**
   * Handle piece drops for drag-and-drop.
   * Validates the move and updates board state accordingly.
   */
  const handlePieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!isInteractive || !targetSquare) return false;

      const move: MoveData = {
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      };

      const success = executeMove(move);

      // Return success to react-chessboard to animate the piece
      return success;
    },
    [isInteractive, executeMove],
  );

  /**
   * Generate arrows for the best engine lines.
   * Shows only the first line's opening move as a green arrow.
   */
  const arrows = useMemo(() => {
    if (engineLines.length === 0) return [];

    const bestLine = engineLines[0];
    if (bestLine.moves.length < 2) return [];

    return [
      {
        startSquare: bestLine.moves[0],
        endSquare: bestLine.moves[1],
        color: "#10b981",
      },
    ];
  }, [engineLines]);

  /**
   * Memoize board options to prevent unnecessary re-renders.
   */
  const boardOptions = useMemo(
    () => ({
      position: fen,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      boardOrientation: (isFlipped ? "black" : "white") as "white" | "black",
      squareStyles: highlightSquares,
      arrows,
      boardStyle: {
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
      darkSquareStyle: { backgroundColor: "#769656" },
      lightSquareStyle: { backgroundColor: "#eeeed2" },
      transitionDuration: 300,
    }),
    [
      fen,
      handlePieceDrop,
      handleSquareClick,
      highlightSquares,
      arrows,
      isFlipped,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-lg">
      <Chessboard options={boardOptions as unknown as ChessboardOptions} />
    </div>
  );
}
