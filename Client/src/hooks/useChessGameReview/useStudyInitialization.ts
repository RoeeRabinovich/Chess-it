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

    // Log the starting position from studyGameState
    const startingFen =
      studyGameState.position ||
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    console.log(
      "🔍 [useStudyInitialization] Starting FEN from studyGameState:",
      startingFen,
    );
    console.log(
      "🔍 [useStudyInitialization] studyGameState.position:",
      studyGameState.position,
    );
    console.log(
      "🔍 [useStudyInitialization] studyGameState.moveTree length:",
      studyGameState.moveTree?.length || 0,
    );

    if (!studyGameState.moveTree || studyGameState.moveTree.length === 0) {
      try {
        chessRef.current.load(startingFen);
        const loadedFen = chessRef.current.fen();
        console.log(
          "🔍 [useStudyInitialization] Loaded FEN (no moves):",
          loadedFen,
        );
        setGameState((prev) => ({
          ...prev,
          position: loadedFen,
          moveTree: [],
          currentPath: [],
        }));
        initializedRef.current = studyKey;
      } catch (error) {
        console.error(
          "❌ [useStudyInitialization] Error loading starting position:",
          error,
        );
        chessRef.current.reset();
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moveTree: [],
          currentPath: [],
        }));
        initializedRef.current = studyKey;
      }
      return;
    }

    try {
      // Load the study's starting position instead of resetting
      chessRef.current.load(startingFen);
      const loadedFen = chessRef.current.fen();
      console.log(
        "🔍 [useStudyInitialization] Loaded starting FEN:",
        loadedFen,
      );
      const commentsMap = commentsToMap(studyGameState.comments);

      setGameState((prev) => {
        if (
          prev.position === loadedFen &&
          prev.currentPath.length === 0 &&
          prev.moveTree.length === studyGameState.moveTree.length
        ) {
          return prev;
        }
        console.log(
          "🔍 [useStudyInitialization] Setting gameState with position:",
          loadedFen,
        );
        return {
          ...prev,
          position: loadedFen,
          moveTree: studyGameState.moveTree,
          // Always start at starting position in review mode, ignore saved currentPath
          currentPath: [],
          comments: commentsMap,
        };
      });
      initializedRef.current = studyKey;
    } catch (error) {
      console.error(
        "❌ [useStudyInitialization] Error initializing chess game from study:",
        error,
      );
      // Fallback to default position if study position is invalid
      chessRef.current.reset();
      const fallbackFen = chessRef.current.fen();
      console.log(
        "🔍 [useStudyInitialization] Using fallback FEN:",
        fallbackFen,
      );
      setGameState((prev) => ({
        ...prev,
        position: fallbackFen,
        moveTree: [],
        currentPath: [],
      }));
      initializedRef.current = studyKey;
    }
  }, [studyKey, studyGameState, chessRef]);

  return [gameState, setGameState];
};
