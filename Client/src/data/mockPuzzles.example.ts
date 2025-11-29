/**
 * Example Mock Puzzles - Corrected Structure
 *
 * Structure:
 * - FEN: Position BEFORE computer's first move (moves[0])
 * - moves[0]: Computer's setup move (played automatically)
 * - moves[1]: Player's first critical move (the puzzle starts here)
 * - moves[2]: Computer's response
 * - moves[3]: Player's next move
 * - etc.
 */

import { Puzzle } from "../services/puzzleService";

export const exampleMockPuzzles: Puzzle[] = [
  // Example 1: Immortal Game - Queen Sacrifice
  {
    id: "immortal-game-queen-sacrifice",
    rating: 1800,
    themes: ["sacrifice", "checkmate", "middlegame", "crushing"],
    fen: "rnb1k1nr/p2p1ppp/3B4/1p1NPN1P/6P1/3P1Q2/P1P5/q5b1 b - - 1 1",
    moves: [
      "h4h5", // Computer: Sets up the position (move before the puzzle)
      "d3d4", // Player: Find the brilliant sacrifice! (critical move)
      "d4c5", // Computer: Takes the pawn
      "c4f7", // Player: Bishop sacrifice!
      "e8f7", // Computer: Takes the bishop
      "e1e5", // Player: Rook sacrifice!
      "f7g6", // Computer: King moves
      "h1h5", // Player: Another rook sacrifice!
      "g6h5", // Computer: Takes the rook
      "f3g5", // Player: Knight check!
      "h5g6", // Computer: King moves
      "d1f3", // Player: Queen joins the attack
      "g6g5", // Computer: King moves
      "f3f6", // Player: Checkmate!
    ],
    playerMoves: 4,
    gameId: "immortal-game-1851",
  },

  // Example 2: Evergreen Game - Double Rook Sacrifice
  {
    id: "evergreen-game-rook-sacrifice",
    rating: 1700,
    themes: ["sacrifice", "checkmate", "middlegame", "attraction"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3",
    moves: [
      "f6e4", // Computer: Black knight moves to center (sets up the position)
      "f3e5", // Player: Knight sacrifice! (critical move - brilliant sacrifice)
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
      "f1g2", // Computer: Black queen takes (puzzle ends - in actual game White would have a winning continuation)
    ],
    playerMoves: 4,
    gameId: "evergreen-game-1852",
  },

  // Example 3: Opera Game - Back Rank Mate
  {
    id: "opera-game-back-rank",
    rating: 1600,
    themes: ["backRankMate", "checkmate", "middlegame", "sacrifice"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    moves: [
      "b8c6", // Computer: Develops knight
      "c4f7", // Player: Bishop sacrifice! (critical move)
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

  // Example 4: Smothered Mate Pattern
  {
    id: "smothered-mate-classic",
    rating: 1500,
    themes: ["smotheredMate", "checkmate", "middlegame", "sacrifice"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    moves: [
      "f6e4", // Computer: Knight moves
      "d1d8", // Player: Queen sacrifice! (critical move)
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

  // Example 5: Endgame Tactics - Promotion
  {
    id: "endgame-promotion-tactic",
    rating: 1400,
    themes: ["promotion", "endgame", "advantage", "pawnEndgame"],
    fen: "8/5k2/8/4P3/8/8/5K2/8 w - - 0 1",
    moves: [
      "f7e7", // Computer: King moves
      "e5e6", // Player: Pawn advance! (critical move)
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
];
