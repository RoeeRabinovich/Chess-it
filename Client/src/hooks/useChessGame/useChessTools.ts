import { useCallback } from "react";
import type { Chess } from "chess.js";
import type {
  BranchContext,
  ChessGameState,
  ChessMove,
} from "../../types/chess";

interface UseChessToolsParams {
  chessRef: React.MutableRefObject<Chess>;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  createInitialState: () => ChessGameState;
  setCurrentBranchContext: React.Dispatch<
    React.SetStateAction<BranchContext | null>
  >;
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
          moves: [],
          branches: [],
          currentMoveIndex: -1,
          comments: new Map<string, string>(),
        }));
        setCurrentBranchContext(null);
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
        const moves = chessRef.current.history({
          verbose: true,
        }) as ChessMove[];
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moves,
          branches: [],
          currentMoveIndex: moves.length - 1,
          comments: new Map<string, string>(),
        }));
        setCurrentBranchContext(null);
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
    setCurrentBranchContext(null);
  }, [chessRef, createInitialState, setCurrentBranchContext, setGameState]);

  return {
    flipBoard,
    loadFEN,
    loadPGN,
    resetGame,
  };
};
