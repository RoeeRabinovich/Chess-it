import { useState, useCallback } from "react";
import { ChessMove } from "../types/chess";

// Simple opening detection based on move sequences
const OPENING_DATABASE = {
  "e2e4 e7e5": { name: "King's Pawn Game", eco: "C20" },
  "e2e4 e7e5 g1f3": { name: "King's Knight Opening", eco: "C40" },
  "e2e4 e7e5 g1f3 b8c6": { name: "Italian Game", eco: "C50" },
  "e2e4 e7e5 g1f3 b8c6 f1c4": { name: "Italian Game", eco: "C50" },
  "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5": { name: "Italian Game", eco: "C50" },
  "e2e4 c7c5": { name: "Sicilian Defense", eco: "B20" },
  "e2e4 c7c5 g1f3": { name: "Sicilian Defense", eco: "B20" },
  "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6": {
    name: "Sicilian Defense, Najdorf",
    eco: "B90",
  },
  "d2d4 d7d5": { name: "Queen's Pawn Game", eco: "D00" },
  "d2d4 d7d5 c2c4": { name: "Queen's Gambit", eco: "D06" },
  "d2d4 d7d5 c2c4 e7e6": { name: "Queen's Gambit Declined", eco: "D30" },
};

export const useOpeningDetection = () => {
  const [opening, setOpening] = useState<{ name: string; eco: string } | null>(
    null,
  );

  const detectOpening = useCallback((moves: ChessMove[]) => {
    if (moves.length === 0) {
      setOpening(null);
      return;
    }

    // Convert moves to LAN format for matching
    const moveSequence = moves.map((move) => move.lan).join(" ");

    // Find the longest matching sequence
    let bestMatch = null;
    let bestLength = 0;

    for (const [sequence, openingData] of Object.entries(OPENING_DATABASE)) {
      if (
        moveSequence.startsWith(sequence) &&
        sequence.split(" ").length > bestLength
      ) {
        bestMatch = openingData;
        bestLength = sequence.split(" ").length;
      }
    }

    setOpening(bestMatch);
  }, []);

  return {
    opening,
    detectOpening,
  };
};
