import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";

interface SquareClickArgs {
  square: string;
  piece: { pieceType: string } | null;
}

interface PieceDropArgs {
  sourceSquare: string;
  targetSquare: string | null;
}

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
  /** Flip the board to view from black's perspective */
  isFlipped?: boolean;
  /** Optional arrows (e.g., engine lines or highlights) */
  engineLines?: EngineLine[];
  /** Allow or disallow user moves */
  isInteractive?: boolean;
}

export default function ChessBoard({
  position,
  onMove,
  isFlipped = false,
  engineLines = [],
  isInteractive = true,
}: ChessBoardProps) {
  const chessGameRef = useRef(new Chess(position));
  const positionRef = useRef(position);

  const [chessPosition, setChessPosition] = useState(position);
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});

  // Update chess game when position prop changes
  useEffect(() => {
    if (position !== positionRef.current) {
      positionRef.current = position;
      try {
        chessGameRef.current.load(position);
        setChessPosition(chessGameRef.current.fen());
        setMoveFrom("");
        setOptionSquares({});
      } catch (error) {
        console.error("Invalid FEN position:", error);
      }
    }
  }, [position]);

  // Get move options for a square to show valid moves
  const getMoveOptions = useCallback((square: Square): boolean => {
    const moves = chessGameRef.current.moves({ square, verbose: true });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};

    for (const move of moves) {
      const targetPiece = chessGameRef.current.get(move.to);
      const sourcePiece = chessGameRef.current.get(square);
      const isCapture = targetPiece && targetPiece.color !== sourcePiece?.color;

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

    setOptionSquares(newSquares);
    return true;
  }, []);

  // Handle square clicks
  const onSquareClick = useCallback(
    ({ square, piece }: SquareClickArgs) => {
      if (!isInteractive) return;

      // Piece clicked to move
      if (!moveFrom && piece) {
        const hasMoveOptions = getMoveOptions(square as Square);
        if (hasMoveOptions) {
          setMoveFrom(square);
        }
        return;
      }

      // Square clicked to move to
      const moves = chessGameRef.current.moves({
        square: moveFrom as Square,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square,
      );

      // Not a valid move
      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square as Square);
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      // Valid move found
      try {
        const move = chessGameRef.current.move({
          from: moveFrom,
          to: square,
          promotion: "q",
        });

        // Check with parent if move should be committed
        const shouldCommit = onMove?.(move) ?? true;

        if (shouldCommit === false) {
          chessGameRef.current.undo();
          return;
        }

        setChessPosition(chessGameRef.current.fen());
        setMoveFrom("");
        setOptionSquares({});
      } catch {
        // Invalid move - just clear and select new square if applicable
        const hasMoveOptions = getMoveOptions(square as Square);
        setMoveFrom(hasMoveOptions ? square : "");
      }
    },
    [moveFrom, isInteractive, getMoveOptions, onMove],
  );

  // Handle piece drops for drag-and-drop
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropArgs): boolean => {
      if (!isInteractive || !targetSquare) {
        return false;
      }

      try {
        const move = chessGameRef.current.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        // Check with parent if move should be committed
        const shouldCommit = onMove?.(move) ?? true;

        if (shouldCommit === false) {
          chessGameRef.current.undo();
          return false;
        }

        setChessPosition(chessGameRef.current.fen());
        setMoveFrom("");
        setOptionSquares({});

        return true;
      } catch {
        return false;
      }
    },
    [isInteractive, onMove],
  );

  // Generate arrows for engine lines
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

  // Memoize board options
  const chessboardOptions = useMemo(
    () => ({
      onSquareClick,
      onPieceDrop,
      position: chessPosition,
      boardOrientation: (isFlipped ? "black" : "white") as "white" | "black",
      squareStyles: optionSquares,
      arrows,
      boardStyle: {
        borderRadius: "12px",
        boxShadow: "none",
        border: "2px solid #e5e7eb",
      },
      darkSquareStyle: { backgroundColor: "#769656" },
      lightSquareStyle: { backgroundColor: "#eeeed2" },
      animationDurationInMs: 100,
    }),
    [
      onSquareClick,
      onPieceDrop,
      chessPosition,
      isFlipped,
      optionSquares,
      arrows,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-lg">
      <Chessboard options={chessboardOptions} />
    </div>
  );
}
