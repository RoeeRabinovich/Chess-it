import { useCallback } from "react";
import type { Chess } from "chess.js";
import type { ChessGameState, MovePath } from "../../types/chess";
import { toChessMove } from "../../utils/chessMoveUtils";
import { useUndoMove } from "./undoMoveHandler";

interface UseChessToolsParams {
  chessRef: React.MutableRefObject<Chess>;
  gameState: ChessGameState;
  setGameState: React.Dispatch<React.SetStateAction<ChessGameState>>;
  createInitialState: () => ChessGameState;
  getCommentKey: (path: MovePath) => string;
}

export const useChessTools = ({
  chessRef,
  gameState,
  setGameState,
  createInitialState,
  getCommentKey,
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
          startingPosition: fen,
          moveTree: [],
          rootBranches: [],
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
        const headers = chessRef.current.header();
        const setUp = headers.SetUp;
        const fenHeader = headers.FEN;
        const defaultFen =
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const startingPosition =
          setUp === "1" && fenHeader ? fenHeader : defaultFen;

        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          startingPosition,
          moveTree,
          rootBranches: [],
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

  const undoMove = useUndoMove({
    chessRef,
    gameState,
    setGameState,
    getCommentKey,
  });

  return {
    flipBoard,
    loadFEN,
    loadPGN,
    resetGame,
    undoMove,
  };
};
