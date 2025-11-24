/**
 * Puzzle theme configuration
 * Maps API theme keys to display names
 */
export interface PuzzleTheme {
  key: string;
  name: string;
  category?:
    | "gamePhase"
    | "tactical"
    | "checkmate"
    | "endgameType"
    | "difficulty"
    | "special";
}

export const PUZZLE_THEMES: PuzzleTheme[] = [
  // Game Phase
  { key: "opening", name: "Opening", category: "gamePhase" },
  { key: "middlegame", name: "Middlegame", category: "gamePhase" },
  { key: "endgame", name: "Endgame", category: "gamePhase" },

  // Tactical Themes
  { key: "advancedPawn", name: "Advanced pawn", category: "tactical" },
  { key: "advantage", name: "Advantage", category: "tactical" },
  { key: "attackingF2F7", name: "Attacking f2 or f7", category: "tactical" },
  { key: "attraction", name: "Attraction", category: "tactical" },
  { key: "castling", name: "Castling", category: "tactical" },
  {
    key: "capturingDefender",
    name: "Capture the defender",
    category: "tactical",
  },
  { key: "crushing", name: "Crushing", category: "tactical" },
  { key: "clearance", name: "Clearance", category: "tactical" },
  { key: "defensiveMove", name: "Defensive move", category: "tactical" },
  { key: "deflection", name: "Deflection", category: "tactical" },
  { key: "discoveredAttack", name: "Discovered attack", category: "tactical" },
  { key: "doubleCheck", name: "Double check", category: "tactical" },
  { key: "enPassant", name: "En passant", category: "tactical" },
  { key: "exposedKing", name: "Exposed king", category: "tactical" },
  { key: "fork", name: "Fork", category: "tactical" },
  { key: "hangingPiece", name: "Hanging piece", category: "tactical" },
  { key: "interference", name: "Interference", category: "tactical" },
  { key: "intermezzo", name: "Intermezzo", category: "tactical" },
  { key: "kingsideAttack", name: "Kingside attack", category: "tactical" },
  { key: "pin", name: "Pin", category: "tactical" },
  { key: "promotion", name: "Promotion", category: "tactical" },
  { key: "queensideAttack", name: "Queenside attack", category: "tactical" },
  { key: "quietMove", name: "Quiet move", category: "tactical" },
  { key: "sacrifice", name: "Sacrifice", category: "tactical" },
  { key: "skewer", name: "Skewer", category: "tactical" },
  { key: "trappedPiece", name: "Trapped piece", category: "tactical" },
  { key: "underPromotion", name: "Underpromotion", category: "tactical" },
  { key: "xRayAttack", name: "X-Ray attack", category: "tactical" },
  { key: "zugzwang", name: "Zugzwang", category: "tactical" },
  { key: "equality", name: "Equality", category: "tactical" },

  // Checkmate Patterns
  { key: "anastasiaMate", name: "Anastasia's mate", category: "checkmate" },
  { key: "arabianMate", name: "Arabian mate", category: "checkmate" },
  { key: "backRankMate", name: "Back rank mate", category: "checkmate" },
  { key: "balestraMate", name: "Balestra mate", category: "checkmate" },
  { key: "blindSwineMate", name: "Blind Swine mate", category: "checkmate" },
  { key: "bodenMate", name: "Boden's mate", category: "checkmate" },
  {
    key: "doubleBishopMate",
    name: "Double bishop mate",
    category: "checkmate",
  },
  { key: "dovetailMate", name: "Dovetail mate", category: "checkmate" },
  { key: "hookMate", name: "Hook mate", category: "checkmate" },
  { key: "killBoxMate", name: "Kill box mate", category: "checkmate" },
  { key: "smotheredMate", name: "Smothered mate", category: "checkmate" },
  { key: "triangleMate", name: "Triangle mate", category: "checkmate" },
  { key: "vukovicMate", name: "Vukovic mate", category: "checkmate" },
  { key: "mate", name: "Checkmate", category: "checkmate" },
  { key: "mateIn1", name: "Mate in 1", category: "checkmate" },
  { key: "mateIn2", name: "Mate in 2", category: "checkmate" },
  { key: "mateIn3", name: "Mate in 3", category: "checkmate" },
  { key: "mateIn4", name: "Mate in 4", category: "checkmate" },
  { key: "mateIn5", name: "Mate in 5 or more", category: "checkmate" },

  // Endgame Types
  { key: "bishopEndgame", name: "Bishop endgame", category: "endgameType" },
  { key: "knightEndgame", name: "Knight endgame", category: "endgameType" },
  { key: "pawnEndgame", name: "Pawn endgame", category: "endgameType" },
  { key: "queenEndgame", name: "Queen endgame", category: "endgameType" },
  { key: "queenRookEndgame", name: "Queen and Rook", category: "endgameType" },
  { key: "rookEndgame", name: "Rook endgame", category: "endgameType" },

  // Difficulty
  { key: "short", name: "Short puzzle", category: "difficulty" },
  { key: "long", name: "Long puzzle", category: "difficulty" },
  { key: "veryLong", name: "Very long puzzle", category: "difficulty" },
  { key: "oneMove", name: "One-move puzzle", category: "difficulty" },

  // Special
  { key: "mix", name: "Healthy mix", category: "special" },
  { key: "master", name: "Master games", category: "special" },
  {
    key: "masterVsMaster",
    name: "Master vs Master games",
    category: "special",
  },
  { key: "superGM", name: "Super GM games", category: "special" },
  { key: "playerGames", name: "Player games", category: "special" },
];

/**
 * Get theme by key
 */
export const getThemeByKey = (key: string): PuzzleTheme | undefined => {
  return PUZZLE_THEMES.find((theme) => theme.key === key);
};

/**
 * Get theme keys from selected theme names
 */
export const getThemeKeys = (themeNames: string[]): string[] => {
  return PUZZLE_THEMES.filter((theme) => themeNames.includes(theme.name)).map(
    (theme) => theme.key,
  );
};

/**
 * Get theme names from theme keys
 */
export const getThemeNames = (themeKeys: string[]): string[] => {
  return PUZZLE_THEMES.filter((theme) => themeKeys.includes(theme.key)).map(
    (theme) => theme.name,
  );
};
