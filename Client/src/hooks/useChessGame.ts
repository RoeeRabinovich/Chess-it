import { useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import {
  ChessMove,
  ChessGameState,
  MoveData,
  MoveBranch,
} from "../types/chess";

export const useChessGame = () => {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useState<ChessGameState>({
    position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
    branches: [],
    currentMoveIndex: -1,
    isFlipped: false,
  });

  const makeMove = useCallback((move: MoveData) => {
    try {
      // Check if we're at the end of the main line
      const isAtEndOfMainLine =
        gameState.currentMoveIndex === gameState.moves.length - 1;

      // If we're not at the end, we're creating a branch
      if (!isAtEndOfMainLine) {
        // Find existing branch at this position
        const existingBranch = gameState.branches.find(
          (b) => b.startIndex === gameState.currentMoveIndex,
        );

        const result = chessRef.current.move(move);
        if (result) {
          const newMove: ChessMove = {
            from: result.from,
            to: result.to,
            promotion: result.promotion,
            san: result.san,
            lan: result.lan,
            before: result.before,
            after: result.after,
            captured: result.captured,
            flags: result.flags,
            piece: result.piece,
            color: result.color,
          };

          if (existingBranch) {
            // Update existing branch by appending the new move
            setGameState((prev) => ({
              ...prev,
              position: chessRef.current.fen(),
              branches: prev.branches.map((b) =>
                b.id === existingBranch.id
                  ? { ...b, moves: [...b.moves, newMove] }
                  : b,
              ),
              currentMoveIndex: prev.currentMoveIndex + 1,
            }));
          } else {
            // Create new branch
            const branchId = `branch-${gameState.currentMoveIndex}-${Date.now()}`;
            const newBranch: MoveBranch = {
              id: branchId,
              parentMoveIndex: gameState.currentMoveIndex,
              moves: [newMove],
              startIndex: gameState.currentMoveIndex,
            };

            setGameState((prev) => ({
              ...prev,
              position: chessRef.current.fen(),
              branches: [...prev.branches, newBranch],
              currentMoveIndex: prev.currentMoveIndex + 1,
            }));
          }

          return true;
        }
        return false;
      } else {
        // Normal move at the end of main line
        const result = chessRef.current.move(move);
        if (result) {
          const newMove: ChessMove = {
            from: result.from,
            to: result.to,
            promotion: result.promotion,
            san: result.san,
            lan: result.lan,
            before: result.before,
            after: result.after,
            captured: result.captured,
            flags: result.flags,
            piece: result.piece,
            color: result.color,
          };

          setGameState((prev) => ({
            ...prev,
            position: chessRef.current.fen(),
            moves: [...prev.moves, newMove],
            currentMoveIndex: prev.currentMoveIndex + 1,
          }));

          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Invalid move:", error);
      return false;
    }
  }, [gameState]);

  const undoMove = useCallback(() => {
    try {
      const move = chessRef.current.undo();
      if (move) {
        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          moves: prev.moves.slice(0, -1),
          currentMoveIndex: Math.max(-1, prev.currentMoveIndex - 1),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  }, []);

  const redoMove = useCallback(() => {
    // For redo, we need to implement move history tracking
    // This is a simplified version
    return false;
  }, []);

  const resetGame = useCallback(() => {
    chessRef.current.reset();
    setGameState({
      position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: [],
      branches: [],
      currentMoveIndex: -1,
      isFlipped: false,
    });
  }, []);

  const flipBoard = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
  }, []);

  const loadFEN = useCallback((fen: string) => {
    try {
      chessRef.current.load(fen);
      setGameState((prev) => ({
        ...prev,
        position: fen,
        moves: [],
        branches: [],
        currentMoveIndex: -1,
      }));
      return true;
    } catch (error) {
      console.error("Invalid FEN:", error);
      return false;
    }
  }, []);

  const loadPGN = useCallback((pgn: string) => {
    try {
      chessRef.current.loadPgn(pgn);
      const moves = chessRef.current.history({ verbose: true }) as ChessMove[];
      setGameState((prev) => ({
        ...prev,
        position: chessRef.current.fen(),
        moves,
        branches: [],
        currentMoveIndex: moves.length - 1,
      }));
      return true;
    } catch (error) {
      console.error("Invalid PGN:", error);
      return false;
    }
  }, []);

  const navigateToMove = useCallback(
    (moveIndex: number) => {
      try {
        chessRef.current.reset();
        const movesToReplay = gameState.moves.slice(0, moveIndex + 1);

        for (const move of movesToReplay) {
          chessRef.current.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
        }

        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          currentMoveIndex: moveIndex,
        }));
      } catch (error) {
        console.error("Error navigating to move:", error);
      }
    },
    [gameState.moves],
  );

  return {
    gameState,
    makeMove,
    undoMove,
    redoMove,
    resetGame,
    flipBoard,
    loadFEN,
    loadPGN,
    navigateToMove,
    canUndo: gameState.currentMoveIndex >= 0,
    canRedo: false, // Simplified - would need move history for proper redo
  };
};
