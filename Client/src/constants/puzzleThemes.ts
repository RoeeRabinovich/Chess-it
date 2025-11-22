/**
 * Puzzle theme configuration
 * Maps API theme keys to display names and descriptions
 */
export interface PuzzleTheme {
  key: string;
  name: string;
  description: string;
}

export const PUZZLE_THEMES: PuzzleTheme[] = [
  { key: "advancedPawn", name: "Advanced pawn", description: "One of your pawns is deep into the opponent position, maybe threatening to promote." },
  { key: "advantage", name: "Advantage", description: "Seize your chance to get a decisive advantage. (200cp ≤ eval ≤ 600cp)" },
  { key: "anastasiaMate", name: "Anastasia's mate", description: "A knight and rook or queen team up to trap the opposing king between the side of the board and a friendly piece." },
  { key: "arabianMate", name: "Arabian mate", description: "A knight and a rook team up to trap the opposing king on a corner of the board." },
  { key: "attackingF2F7", name: "Attacking f2 or f7", description: "An attack focusing on the f2 or f7 pawn, such as in the fried liver opening." },
  { key: "attraction", name: "Attraction", description: "An exchange or sacrifice encouraging or forcing an opponent piece to a square that allows a follow-up tactic." },
  { key: "backRankMate", name: "Back rank mate", description: "Checkmate the king on the home rank, when it is trapped there by its own pieces." },
  { key: "balestraMate", name: "Balestra mate", description: "A bishop delivers the checkmate, while a queen blocks the remaining escape squares" },
  { key: "blindSwineMate", name: "Blind Swine mate", description: "Two rooks team up to mate the king in an area of 2 by 2 squares." },
  { key: "bishopEndgame", name: "Bishop endgame", description: "An endgame with only bishops and pawns." },
  { key: "bodenMate", name: "Boden's mate", description: "Two attacking bishops on criss-crossing diagonals deliver mate to a king obstructed by friendly pieces." },
  { key: "castling", name: "Castling", description: "Bring the king to safety, and deploy the rook for attack." },
  { key: "capturingDefender", name: "Capture the defender", description: "Removing a piece that is critical to defence of another piece, allowing the now undefended piece to be captured on a following move." },
  { key: "crushing", name: "Crushing", description: "Spot the opponent blunder to obtain a crushing advantage. (eval ≥ 600cp)" },
  { key: "doubleBishopMate", name: "Double bishop mate", description: "Two attacking bishops on adjacent diagonals deliver mate to a king obstructed by friendly pieces." },
  { key: "dovetailMate", name: "Dovetail mate", description: "A queen delivers mate to an adjacent king, whose only two escape squares are obstructed by friendly pieces." },
  { key: "equality", name: "Equality", description: "Come back from a losing position, and secure a draw or a balanced position. (eval ≤ 200cp)" },
  { key: "kingsideAttack", name: "Kingside attack", description: "An attack of the opponent's king, after they castled on the king side." },
  { key: "clearance", name: "Clearance", description: "A move, often with tempo, that clears a square, file or diagonal for a follow-up tactical idea." },
  { key: "defensiveMove", name: "Defensive move", description: "A precise move or sequence of moves that is needed to avoid losing material or another advantage." },
  { key: "deflection", name: "Deflection", description: "A move that distracts an opponent piece from another duty that it performs, such as guarding a key square. Sometimes also called \"overloading\"." },
  { key: "discoveredAttack", name: "Discovered attack", description: "Moving a piece (such as a knight), that previously blocked an attack by a long range piece (such as a rook), out of the way of that piece." },
  { key: "doubleCheck", name: "Double check", description: "Checking with two pieces at once, as a result of a discovered attack where both the moving piece and the unveiled piece attack the opponent's king." },
  { key: "endgame", name: "Endgame", description: "A tactic during the last phase of the game." },
  { key: "enPassant", name: "En passant", description: "A tactic involving the en passant rule, where a pawn can capture an opponent pawn that has bypassed it using its initial two-square move." },
  { key: "exposedKing", name: "Exposed king", description: "A tactic involving a king with few defenders around it, often leading to checkmate." },
  { key: "fork", name: "Fork", description: "A move where the moved piece attacks two opponent pieces at once." },
  { key: "hangingPiece", name: "Hanging piece", description: "A tactic involving an opponent piece being undefended or insufficiently defended and free to capture." },
  { key: "hookMate", name: "Hook mate", description: "Checkmate with a rook, knight, and pawn along with one enemy pawn to limit the enemy king's escape." },
  { key: "interference", name: "Interference", description: "Moving a piece between two opponent pieces to leave one or both opponent pieces undefended, such as a knight on a defended square between two rooks." },
  { key: "intermezzo", name: "Intermezzo", description: "Instead of playing the expected move, first interpose another move posing an immediate threat that the opponent must answer. Also known as \"Zwischenzug\" or \"In between\"." },
  { key: "killBoxMate", name: "Kill box mate", description: "A rook is next to the enemy king and supported by a queen that also blocks the king's escape squares. The rook and the queen catch the enemy king in a 3 by 3 \"kill box\"." },
  { key: "triangleMate", name: "Triangle mate", description: "The queen and rook, one square away from the enemy king, are on the same rank or file, separated by one square, forming a triangle." },
  { key: "vukovicMate", name: "Vukovic mate", description: "A rook and knight team up to mate the king. The rook delivers mate while supported by a third piece, and the knight is used to block the king's escape squares." },
  { key: "knightEndgame", name: "Knight endgame", description: "An endgame with only knights and pawns." },
  { key: "long", name: "Long puzzle", description: "Three moves to win." },
  { key: "master", name: "Master games", description: "Puzzles from games played by titled players." },
  { key: "masterVsMaster", name: "Master vs Master games", description: "Puzzles from games between two titled players." },
  { key: "mate", name: "Checkmate", description: "Win the game with style." },
  { key: "mateIn1", name: "Mate in 1", description: "Deliver checkmate in one move." },
  { key: "mateIn2", name: "Mate in 2", description: "Deliver checkmate in two moves." },
  { key: "mateIn3", name: "Mate in 3", description: "Deliver checkmate in three moves." },
  { key: "mateIn4", name: "Mate in 4", description: "Deliver checkmate in four moves." },
  { key: "mateIn5", name: "Mate in 5 or more", description: "Figure out a long mating sequence." },
  { key: "middlegame", name: "Middlegame", description: "A tactic during the second phase of the game." },
  { key: "oneMove", name: "One-move puzzle", description: "A puzzle that is only one move long." },
  { key: "opening", name: "Opening", description: "A tactic during the first phase of the game." },
  { key: "pawnEndgame", name: "Pawn endgame", description: "An endgame with only pawns." },
  { key: "pin", name: "Pin", description: "A tactic involving pins, where a piece is unable to move without revealing an attack on a higher value piece." },
  { key: "promotion", name: "Promotion", description: "Promote one of your pawn to a queen or minor piece." },
  { key: "queenEndgame", name: "Queen endgame", description: "An endgame with only queens and pawns." },
  { key: "queenRookEndgame", name: "Queen and Rook", description: "An endgame with only queens, rooks and pawns." },
  { key: "queensideAttack", name: "Queenside attack", description: "An attack of the opponent's king, after they castled on the queen side." },
  { key: "quietMove", name: "Quiet move", description: "A move that does neither make a check or capture, nor an immediate threat to capture, but does prepare a more hidden unavoidable threat for a later move." },
  { key: "rookEndgame", name: "Rook endgame", description: "An endgame with only rooks and pawns." },
  { key: "sacrifice", name: "Sacrifice", description: "A tactic involving giving up material in the short-term, to gain an advantage again after a forced sequence of moves." },
  { key: "short", name: "Short puzzle", description: "Two moves to win." },
  { key: "skewer", name: "Skewer", description: "A motif involving a high value piece being attacked, moving out the way, and allowing a lower value piece behind it to be captured or attacked, the inverse of a pin." },
  { key: "smotheredMate", name: "Smothered mate", description: "A checkmate delivered by a knight in which the mated king is unable to move because it is surrounded (or smothered) by its own pieces." },
  { key: "superGM", name: "Super GM games", description: "Puzzles from games played by the best players in the world." },
  { key: "trappedPiece", name: "Trapped piece", description: "A piece is unable to escape capture as it has limited moves." },
  { key: "underPromotion", name: "Underpromotion", description: "Promotion to a knight, bishop, or rook." },
  { key: "veryLong", name: "Very long puzzle", description: "Four moves or more to win." },
  { key: "xRayAttack", name: "X-Ray attack", description: "A piece attacks or defends a square, through an enemy piece." },
  { key: "zugzwang", name: "Zugzwang", description: "The opponent is limited in the moves they can make, and all moves worsen their position." },
  { key: "mix", name: "Healthy mix", description: "A bit of everything. You don't know what to expect, so you remain ready for anything! Just like in real games." },
  { key: "playerGames", name: "Player games", description: "Lookup puzzles generated from your games, or from another player's games." },
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
  return PUZZLE_THEMES.filter((theme) => themeNames.includes(theme.name))
    .map((theme) => theme.key);
};

/**
 * Get theme names from theme keys
 */
export const getThemeNames = (themeKeys: string[]): string[] => {
  return PUZZLE_THEMES.filter((theme) => themeKeys.includes(theme.key))
    .map((theme) => theme.name);
};

