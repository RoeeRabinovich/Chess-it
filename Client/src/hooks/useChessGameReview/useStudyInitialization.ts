import { useEffect, useRef, useState, useMemo } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove } from "../../types/chess";
import { migrateBranchesToTree } from "../../utils/treeMigration";

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
  // Convert old structure to new tree structure
  const moveTree = useMemo(() => {
    return migrateBranchesToTree(
      studyGameState.moves || [],
      studyGameState.branches || [],
    );
  }, [studyGameState.moves, studyGameState.branches]);

  // Calculate currentPath from currentMoveIndex
  const currentPath = useMemo(() => {
    const index = studyGameState.currentMoveIndex ?? -1;
    if (index < 0) {
      return [];
    }
    return [index];
  }, [studyGameState.currentMoveIndex]);

  const [gameState, setGameState] = useState<ChessGameState>(() => ({
    position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moveTree: moveTree,
    currentPath: currentPath,
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
      const emptyTree = migrateBranchesToTree([], []);
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        moveTree: emptyTree,
        currentPath: [],
      }));
      initializedRef.current = studyKey;
      return;
    }

    try {
      chessRef.current.reset();
      const currentFen = chessRef.current.fen();
      const commentsMap = commentsToMap(studyGameState.comments);
      const newMoveTree = migrateBranchesToTree(
        studyGameState.moves,
        studyGameState.branches || [],
      );
      const newCurrentPath =
        studyGameState.currentMoveIndex >= 0
          ? [studyGameState.currentMoveIndex]
          : [];

      setGameState((prev) => {
        if (
          prev.position === currentFen &&
          prev.currentPath.length === newCurrentPath.length &&
          prev.moveTree.length === newMoveTree.length
        ) {
          return prev;
        }
        return {
          ...prev,
          position: currentFen,
          moveTree: newMoveTree,
          currentPath: newCurrentPath,
          comments: commentsMap,
        };
      });
      initializedRef.current = studyKey;
    } catch (error) {
      console.error("Error initializing chess game from study:", error);
      chessRef.current.reset();
      const fallbackTree = migrateBranchesToTree(
        studyGameState.moves || [],
        [],
      );
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        moveTree: fallbackTree,
        currentPath: [],
      }));
      initializedRef.current = studyKey;
    }
  }, [studyKey, studyGameState, chessRef]);

  return [gameState, setGameState];
};

