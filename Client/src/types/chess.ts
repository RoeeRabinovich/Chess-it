// Chess game types and interfaces

/**
 * Complete chess move with all metadata from chess.js
 */
export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  lan: string;
  before: string;
  after: string;
  captured?: string;
  flags: string;
  piece: string;
  color: "w" | "b";
}

/**
 * Simple move data for making moves (from/to/promotion)
 */
export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

/**
 * Arguments for piece drop events on the chess board
 */
export interface PieceDropArgs {
  sourceSquare: string;
  targetSquare: string | null;
}

/**
 * Props for the ChessBoard component
 */
export interface ChessBoardProps {
  /** FEN position to display */
  position: string;
  /** Called when a valid move is made — return false to revert */
  onMove?: (move: MoveData) => boolean | void;
  /** Flip the board to view from black's perspective */
  isFlipped?: boolean;
  /** Allow or disallow user moves */
  isInteractive?: boolean;
  /** Scale factor for the board (0.5 to 1.5) */
  boardScale?: number;
}

/**
 * Engine analysis line with evaluation and moves
 */
export interface EngineLine {
  moves: string[];
  evaluation: number;
  depth: number;
  mate?: number;
}

/**
 * Node in a chess variation tree
 */
export interface VariationNode {
  id: string;
  move: ChessMove;
  fen: string;
  children: VariationNode[];
  parent?: string;
  isMainLine: boolean;
  moveIndex: number; // Index in the main line
}

/**
 * Represents a branch/variation in the move tree
 */
export interface MoveBranch {
  id: string;
  parentMoveIndex: number; // Index of the parent move in main line
  moves: ChessMove[]; // Moves in this branch
  startIndex: number; // Starting move index in main line
}

/**
 * Complete state of a chess game
 */
export interface ChessGameState {
  position: string; // FEN
  moves: ChessMove[]; // Main line moves
  branches: MoveBranch[]; // All branches/variations
  currentMoveIndex: number;
  isFlipped: boolean;
  opening?: {
    name: string;
    eco: string;
  };
}
