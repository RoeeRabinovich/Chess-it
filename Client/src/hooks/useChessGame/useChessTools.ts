import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState } from "../../types/chess";
import { toChessMove } from "../../utils/chessMoveUtils";

interface UseChessToolsParams {
  chessRef: React.MutableRefObject<Chess>;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  createInitialState: () => ChessGameState;
}

export const useChessTools = ({
  chessRef,
  setGameState,
  createInitialState,
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
        return true;
      } catch (error) {
        console.error("Invalid FEN:", error);
        return false;
      }
    },
    [chessRef, setGameState],
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
        return true;
      } catch (error) {
        console.error("Invalid PGN:", error);
        return false;
      }
    },
    [chessRef, setGameState],
  );

  const resetGame = useCallback(() => {
    chessRef.current.reset();
    setGameState(createInitialState());
  }, [chessRef, createInitialState, setGameState]);

  return {
    flipBoard,
    loadFEN,
    loadPGN,
    resetGame,
  };
};
