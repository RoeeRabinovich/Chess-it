import { useEffect, useRef, useState, useMemo } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, MoveNode, MovePath } from "../../types/chess";

interface StudyGameState {
  position: string;
  moveTree: MoveNode[];
  rootBranches?: MoveNode[][];
  startingPosition?: string;
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
const commentsToMap = (
  comments?: Record<string, string>,
): Map<string, string> => {
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
    position:
      studyGameState.position ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moveTree: studyGameState.moveTree || [],
    rootBranches: studyGameState.rootBranches || [],
    startingPosition:
      studyGameState.startingPosition ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    // Always start at starting position in review mode, ignore saved currentPath
    currentPath: [],
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

    const startingFen =
      studyGameState.position ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    if (!studyGameState.moveTree || studyGameState.moveTree.length === 0) {
      try {
        chessRef.current.load(startingFen);
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moveTree: [],
          rootBranches: [],
          startingPosition: startingFen,
          currentPath: [],
        }));
        initializedRef.current = studyKey;
      } catch {
        chessRef.current.reset();
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moveTree: [],
          rootBranches: [],
          startingPosition: startingFen,
          currentPath: [],
        }));
        initializedRef.current = studyKey;
      }
      return;
    }

    try {
      // Load the study's starting position instead of resetting
      chessRef.current.load(startingFen);
      const commentsMap = commentsToMap(studyGameState.comments);

      setGameState((prev) => {
        if (
          prev.position === chessRef.current.fen() &&
          prev.currentPath.length === 0 &&
          prev.moveTree.length === studyGameState.moveTree.length
        ) {
          return prev;
        }
        return {
          ...prev,
          position: chessRef.current.fen(),
          moveTree: studyGameState.moveTree,
          rootBranches: studyGameState.rootBranches || [],
          startingPosition:
            studyGameState.startingPosition ||
            studyGameState.position ||
            startingFen,
          // Always start at starting position in review mode, ignore saved currentPath
          currentPath: [],
          comments: commentsMap,
        };
      });
      initializedRef.current = studyKey;
    } catch {
      // Fallback to default position if study position is invalid
      chessRef.current.reset();
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        moveTree: [],
        rootBranches: [],
        startingPosition: startingFen,
        currentPath: [],
      }));
      initializedRef.current = studyKey;
    }
  }, [studyKey, studyGameState, chessRef]);

  return [gameState, setGameState];
};
