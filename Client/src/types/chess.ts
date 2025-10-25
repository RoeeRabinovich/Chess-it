// Chess game types and interfaces

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

export interface EngineLine {
  moves: string[];
  evaluation: number;
  depth: number;
  mate?: number;
}

export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

export interface VariationNode {
  id: string;
  move: ChessMove;
  fen: string;
  children: VariationNode[];
  parent?: string;
  isMainLine: boolean;
}

export interface ChessGameState {
  position: string; // FEN
  moves: ChessMove[];
  currentVariation: VariationNode[];
  currentMoveIndex: number;
  isFlipped: boolean;
  opening?: {
    name: string;
    eco: string;
  };
}

export interface StockfishConfig {
  depth: number;
  autoDepth: boolean;
  multiPv: number; // Number of lines to analyze
}

export interface EngineAnalysis {
  lines: EngineLine[];
  isAnalyzing: boolean;
  error?: string;
}
