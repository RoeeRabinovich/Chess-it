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
  /** Show board notation (rank/file labels) */
  showNotation?: boolean;
  /** Square to highlight as wrong move (shows red background and X icon) */
  wrongMoveSquare?: string | null;
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
 * Represents a move node in the tree structure.
 * Each node contains a move and can have branches (alternative continuations from the position after this move).
 * Branches are sequences of MoveNodes, allowing unlimited nesting.
 */
export interface MoveNode {
  move: ChessMove;
  branches: MoveNode[][]; // Alternative move sequences (branches/variations) from the position after this move
  // Each branch is an array of MoveNodes (a sequence of moves)
  // Each MoveNode in a branch can also have branches, allowing unlimited nesting
}

/**
 * Path to a specific position in the move tree.
 * Format: Array of segments, where each segment is:
 * - Starting position branches: [-1, branchIndex, moveIndexInBranch, ...]
 * - For main line: just the move index [0, 1, 2, ...]
 * - For branches: [mainIndex, branchIndex, moveIndexInBranch, branchIndex?, ...]
 *
 * Examples:
 * - [5] = main line move 5
 * - [5, 0, 2] = move 2 in branch 0 from main line move 5
 * - [5, 0, 2, 1, 0] = move 0 in branch 1 from move 2 in branch 0 from main line move 5
 * - [-1, 0, 1] = move 1 inside branch 0 that starts from the initial position
 *
 * Path structure: [origin, branchIndex?, moveIndexInBranch?, branchIndex?, ...]
 * - First number: -1 for starting-position branches, otherwise the main-line move index
 * - Subsequent pairs: [branchIndex, moveIndexInBranch]
 * - Can continue with more pairs for deeper nesting
 */
export type MovePath = number[];

/**
 * Complete state of a chess game using tree structure
 */
export interface ChessGameState {
  position: string; // FEN
  moveTree: MoveNode[]; // Main line as array of MoveNodes (each can have branches)
  rootBranches: MoveNode[][]; // Alternative move sequences starting from the initial position
  startingPosition: string; // Original starting FEN for replay/reset
  currentPath: MovePath; // Path to current position in the tree
  isFlipped: boolean;
  opening?: {
    name: string;
    eco: string;
  };
  comments?: Map<string, string>; // Key format: pathToString(path)
}

/**
 * Return type for the useStockfish hook
 */
export interface UseStockfishReturn {
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  positionEvaluation: number;
  depth: number;
  bestLine: string;
  possibleMate: string;
  evaluationPosition: string; // Track which position the evaluation belongs to
  engineLines: Array<{
    moves: string[];
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  enableEngine: () => void;
  disableEngine: () => void;
  toggleEngine: () => void;
}

/**
 * Cached analysis data structure for Stockfish evaluations
 */
export interface CachedAnalysis {
  evaluation: number;
  depth: number;
  bestLine: string;
  possibleMate?: string | null;
  lines?: import("../services/stockfishService").AnalysisLines[];
}

/**
 * Processed engine line after normalization
 */
export interface ProcessedEngineLine {
  moves: string[];
  evaluation: number;
  depth: number;
  possibleMate?: string | null;
  multipvOrder?: number; // Preserve Stockfish's MultiPV order (1, 2, 3...)
}
