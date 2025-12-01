import { useEffect, useRef, useState, useMemo } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, MoveNode, MovePath } from "../../types/chess";

interface StudyGameState {
  position: string;
  moveTree: MoveNode[];
  currentPath: MovePath;
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
  if (!studyGameState.moveTree || studyGameState.moveTree.length === 0) {
    return "empty";
  }
  const movesKey = studyGameState.moveTree
    .map((n) => `${n.move.from}${n.move.to}`)
    .join(",");
  const pathKey = studyGameState.currentPath.join("-");
  return `${studyGameState.moveTree.length}-${pathKey}-${movesKey}`;
};

export const useStudyInitialization = ({
  studyGameState,
  chessRef,
}: UseStudyInitializationParams): [
  ChessGameState,
  React.Dispatch<React.SetStateAction<ChessGameState>>,
] => {
  const [gameState, setGameState] = useState<ChessGameState>(() => ({
    position: studyGameState.position || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moveTree: studyGameState.moveTree || [],
    currentPath: studyGameState.currentPath || [],
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

    if (!studyGameState.moveTree || studyGameState.moveTree.length === 0) {
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        moveTree: [],
        currentPath: [],
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
          prev.currentPath.length === studyGameState.currentPath.length &&
          prev.moveTree.length === studyGameState.moveTree.length
        ) {
          return prev;
        }
        return {
          ...prev,
          position: currentFen,
          moveTree: studyGameState.moveTree,
          currentPath: studyGameState.currentPath,
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
        moveTree: [],
        currentPath: [],
      }));
      initializedRef.current = studyKey;
    }
  }, [studyKey, studyGameState, chessRef]);

  return [gameState, setGameState];
};

