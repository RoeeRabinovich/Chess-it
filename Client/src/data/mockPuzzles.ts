/**
 * Mock Puzzles - Used as fallback when API returns errors (500, 504, 429, etc.)
 *
 * Structure:
 * - FEN: Position BEFORE computer's first move (moves[0])
 * - moves[0]: Computer's setup move (played automatically)
 * - moves[1]: Player's first critical move (the puzzle starts here)
 * - moves[2]: Computer's response
 * - moves[3]: Player's next move
 * - etc.
 */

import { Puzzle } from "../services/puzzleService/puzzleService";

export const mockPuzzles: Puzzle[] = [
  // 1. Immortal Game - Queen Sacrifice
  {
    id: "immortal-game-queen-sacrifice",
    rating: 1800,
    themes: ["sacrifice", "checkmate", "middlegame", "crushing"],
    fen: "rnb1k1nr/p2p1ppp/3B4/1p1NPN1P/6P1/3P1Q2/P1P1K3/q5b1 b - - 1 1",
    moves: [
      "b8a6", // Computer: Sets up the position
      "f5g7", // Player: Find the brilliant sacrifice!
      "e8d8", // Computer: Takes the pawn
      "f3f6", // Player: Bishop sacrifice!
      "g8f6", // Computer: Takes the bishop
      "d6e7", // Player: Rook sacrifice!
    ],
    playerMoves: 4,
    gameId: "immortal-game-1851",
  },

  // 2. Evergreen Game - Rook and Queen Sacrifice
  {
    id: "evergreen-game-rook-sacrifice",
    rating: 1700,
    themes: ["sacrifice", "checkmate", "middlegame", "attraction"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3",
    moves: [
      "f6e4", // Computer: Black knight moves to center
      "f3e5", // Player: Knight sacrifice! (brilliant tactical move)
      "d8f6", // Computer: Black queen defends
      "d1f3", // Player: Queen joins attack
      "f6f3", // Computer: Black queen takes white queen
      "e1g1", // Player: Castles
      "f3f2", // Computer: Black queen checks
      "g1h1", // Player: King moves
      "f2e1", // Computer: Black queen checks
      "h1g1", // Player: King moves back
      "e1f2", // Computer: Black queen checks
      "g1h1", // Player: King moves
      "f2f1", // Computer: Black queen checks
      "h1g2", // Player: King moves
      "f1g2", // Computer: Black queen takes
    ],
    playerMoves: 4,
    gameId: "evergreen-game-1852",
  },

  // 3. Opera Game - Back Rank Mate
  {
    id: "opera-game-back-rank",
    rating: 1600,
    themes: ["backRankMate", "checkmate", "middlegame", "sacrifice"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "b8c6", // Computer: Develops knight
      "c4f7", // Player: Bishop sacrifice!
      "e8f7", // Computer: King takes
      "e1g1", // Player: Castles
      "f7g8", // Computer: King moves
      "d1f3", // Player: Queen to f3
      "g8f7", // Computer: King moves
      "f1e1", // Player: Rook to e1
      "f7g8", // Computer: King moves
      "f3f6", // Player: Queen sacrifice!
      "g7f6", // Computer: Takes queen
      "e1e8", // Player: Back rank mate!
    ],
    playerMoves: 3,
    gameId: "opera-game-1858",
  },

  // 4. Smothered Mate Pattern
  {
    id: "smothered-mate-classic",
    rating: 1500,
    themes: ["smotheredMate", "checkmate", "middlegame", "sacrifice"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "f6e4", // Computer: Knight moves
      "d1d8", // Player: Queen sacrifice!
      "e8d8", // Computer: Takes queen
      "f3e5", // Player: Knight check
      "d8e8", // Computer: King moves
      "c1g5", // Player: Bishop pins
      "e8f8", // Computer: King moves
      "e5g6", // Player: Knight check
      "f8g8", // Computer: King moves
      "g5h6", // Player: Bishop check
      "g8h8", // Computer: King moves
      "g6f8", // Player: Smothered mate!
    ],
    playerMoves: 3,
    gameId: "smothered-mate-pattern",
  },

  // 5. Endgame Promotion Tactic
  {
    id: "endgame-promotion-tactic",
    rating: 1400,
    themes: ["promotion", "endgame", "advantage", "pawnEndgame"],
    fen: "8/5k2/8/4P3/8/8/5K2/8 b - - 0 1",
    moves: [
      "f7e7", // Computer: King moves
      "e5e6", // Player: Pawn advance!
      "e7d6", // Computer: King tries to stop
      "e6e7", // Player: Pawn advances
      "d6c7", // Computer: King moves
      "e7e8q", // Player: Promote to queen!
      "c7b7", // Computer: King moves
      "e8d7", // Player: Queen checks
      "b7a6", // Computer: King moves
      "d7c6", // Player: Queen checks
      "a6a5", // Computer: King moves
      "c6b5", // Player: Queen checks
      "a5a4", // Computer: King moves
      "b5b4", // Player: Queen checks
      "a4a3", // Computer: King moves
      "b4a3", // Player: Checkmate!
    ],
    playerMoves: 2,
    gameId: "endgame-promotion",
  },

  // 6. Greek Gift Sacrifice
  {
    id: "greek-gift-sacrifice",
    rating: 1650,
    themes: ["sacrifice", "attackingF2F7", "middlegame", "crushing"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "f6e4", // Computer: Knight moves
      "c4f7", // Player: Greek Gift sacrifice!
      "e8f7", // Computer: King takes
      "f3e5", // Player: Knight check
      "f7g8", // Computer: King moves
      "d1f3", // Player: Queen joins attack
      "g8h8", // Computer: King moves
      "f3f6", // Player: Queen check
      "g7f6", // Computer: Takes queen
      "e5f7", // Player: Checkmate!
    ],
    playerMoves: 3,
    gameId: "greek-gift-pattern",
  },

  // 7. Fork Tactic
  {
    id: "fork-tactic-classic",
    rating: 1200,
    themes: ["fork", "middlegame", "advantage"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "b8c6", // Computer: Develops knight
      "f3e5", // Player: Knight fork threat!
      "c6e5", // Computer: Takes knight
      "c4f7", // Player: Bishop fork!
      "e8f7", // Computer: King takes
      "d1d8", // Player: Queen takes rook
      "f7g6", // Computer: King moves
      "d8e8", // Player: Queen checks
      "g6h6", // Computer: King moves
      "e8h8", // Player: Checkmate!
    ],
    playerMoves: 3,
    gameId: "fork-tactic",
  },

  // 8. Pin and Win Material
  {
    id: "pin-tactic-material",
    rating: 1300,
    themes: ["pin", "middlegame", "advantage"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "f6e4", // Computer: Knight moves
      "c1g5", // Player: Pin the knight!
      "d8d7", // Computer: Queen moves
      "g5e7", // Player: Bishop takes
      "d7e7", // Computer: Queen takes
      "f3e5", // Player: Knight fork!
      "e7e5", // Computer: Takes knight
      "d1d8", // Player: Queen takes rook
      "e8d8", // Computer: Takes queen
      "e1g1", // Player: Castles
      "d8e7", // Computer: King moves
      "f1e1", // Player: Rook check
      "e7f6", // Computer: King moves
      "e1e8", // Player: Checkmate!
    ],
    playerMoves: 4,
    gameId: "pin-tactic",
  },

  // 9. Discovered Attack
  {
    id: "discovered-attack-classic",
    rating: 1550,
    themes: ["discoveredAttack", "middlegame", "advantage"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "f6e4", // Computer: Knight moves
      "e1g1", // Player: Castles (discovered attack!)
      "e4c3", // Computer: Knight takes
      "c4f7", // Player: Bishop discovered check!
      "e8f7", // Computer: King takes
      "f1f7", // Player: Rook takes
      "d8f6", // Computer: Queen defends
      "f7f6", // Player: Rook takes queen
      "g7f6", // Computer: Takes rook
      "d1d8", // Player: Checkmate!
    ],
    playerMoves: 3,
    gameId: "discovered-attack",
  },

  // 10. Double Check
  {
    id: "double-check-mate",
    rating: 1750,
    themes: ["doubleCheck", "checkmate", "middlegame"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
    moves: [
      "f6e4", // Computer: Knight moves
      "f3e5", // Player: Knight check
      "e8f7", // Computer: King moves
      "c4f7", // Player: Bishop check
      "f7g8", // Computer: King moves
      "e5f7", // Player: Knight double check!
      "g8h8", // Computer: King moves
      "f7g5", // Player: Knight check
      "h8g8", // Computer: King moves
      "d1f3", // Player: Queen check
      "g8h8", // Computer: King moves
      "f3h5", // Player: Checkmate!
    ],
    playerMoves: 4,
    gameId: "double-check-mate",
  },
];
