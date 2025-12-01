import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, ChessMove } from "../../types/chess";
import { toChessMove } from "../../utils/chessMoveUtils";

interface UseChessToolsParams {
  chessRef: React.MutableRefObject<Chess>;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  createInitialState: () => ChessGameState;
  setCurrentBranchContext?: () => void; // Not needed for tree, but kept for compatibility
}

export const useChessTools = ({
  chessRef,
  setGameState,
  createInitialState,
  setCurrentBranchContext,
}: UseChessToolsParams) => {
  const flipBoard = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
  }, [setGameState]);

  const loadFEN = useCallback(
    (fen: string) => {
      try {
        chessRef.current.load(fen);
        setGameState((prev) => ({
          ...prev,
          position: fen,
          moveTree: [],
          currentPath: [],
          comments: new Map<string, string>(),
        }));
        setCurrentBranchContext?.();
        return true;
      } catch (error) {
        console.error("Invalid FEN:", error);
        return false;
      }
    },
    [chessRef, setCurrentBranchContext, setGameState],
  );

  const loadPGN = useCallback(
    (pgn: string) => {
      try {
        chessRef.current.loadPgn(pgn);
        const history = chessRef.current.history({ verbose: true });
        const moveTree = history.map((move) => ({
          move: toChessMove(move),
          branches: [],
        }));
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moveTree,
          currentPath: moveTree.length > 0 ? [moveTree.length - 1] : [],
          comments: new Map<string, string>(),
        }));
        setCurrentBranchContext?.();
        return true;
      } catch (error) {
        console.error("Invalid PGN:", error);
        return false;
      }
    },
    [chessRef, setCurrentBranchContext, setGameState],
  );

  const resetGame = useCallback(() => {
    chessRef.current.reset();
    setGameState(createInitialState());
    setCurrentBranchContext?.();
  }, [chessRef, createInitialState, setCurrentBranchContext, setGameState]);

  return {
    flipBoard,
    loadFEN,
    loadPGN,
    resetGame,
  };
};
