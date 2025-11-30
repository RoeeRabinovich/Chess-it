import { useEffect, useRef, useState, useMemo } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove } from "../../types/chess";

interface StudyGameState {
  position: string;
  moves: ChessMove[];
  branches: ChessGameState["branches"];
  currentMoveIndex: number;
  isFlipped: boolean;
  opening?: ChessGameState["opening"];
  comments?: Record<string, string>;
}

interface UseStudyInitializationParams {
  studyGameState: StudyGameState;
  chessRef: React.MutableRefObject<Chess>;
}

/**
 * Converts comments from object to Map
 */
const commentsToMap = (comments?: Record<string, string>): Map<string, string> => {
  const commentsMap = new Map<string, string>();
  if (comments) {
    Object.entries(comments).forEach(([key, value]) => {
      commentsMap.set(key, value);
    });
  }
  return commentsMap;
};

/**
 * Creates a stable key from studyGameState to detect changes
 */
const createStudyKey = (studyGameState: StudyGameState): string => {
  if (!studyGameState.moves || studyGameState.moves.length === 0) {
    return "empty";
  }
  const movesKey = studyGameState.moves
    .map((m) => `${m.from}${m.to}`)
    .join(",");
  return `${studyGameState.moves.length}-${studyGameState.currentMoveIndex}-${movesKey}`;
};

export const useStudyInitialization = ({
  studyGameState,
  chessRef,
}: UseStudyInitializationParams): [
  ChessGameState,
  React.Dispatch<React.SetStateAction<ChessGameState>>,
] => {
  const [gameState, setGameState] = useState<ChessGameState>(() => ({
    position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: studyGameState.moves || [],
    branches: studyGameState.branches || [],
    currentMoveIndex: -1,
    isFlipped: studyGameState.isFlipped || false,
    opening: studyGameState.opening,
    comments: commentsToMap(studyGameState.comments),
  }));

  const initializedRef = useRef<string | null>(null);
  const studyKey = useMemo(
    () => createStudyKey(studyGameState),
    [studyGameState],
  );

  useEffect(() => {
    if (initializedRef.current === studyKey) {
      return;
    }

    if (!studyGameState.moves || studyGameState.moves.length === 0) {
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
        moves: [],
      }));
      initializedRef.current = studyKey;
      return;
    }

    try {
      chessRef.current.reset();
      const currentFen = chessRef.current.fen();
      const commentsMap = commentsToMap(studyGameState.comments);

      setGameState((prev) => {
        if (
          prev.position === currentFen &&
          prev.currentMoveIndex === -1 &&
          prev.moves.length === studyGameState.moves.length
        ) {
          return prev;
        }
        return {
          ...prev,
          position: currentFen,
          moves: studyGameState.moves,
          branches: studyGameState.branches || [],
          currentMoveIndex: -1,
          comments: commentsMap,
        };
      });
      initializedRef.current = studyKey;
    } catch (error) {
      console.error("Error initializing chess game from study:", error);
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        currentMoveIndex: -1,
        moves: studyGameState.moves || [],
      }));
      initializedRef.current = studyKey;
    }
  }, [studyKey, studyGameState, chessRef]);

  return [gameState, setGameState];
};

