import { useMemo, useRef, useState } from "react";

import { Chess } from "chess.js";

import type { ChessGameState } from "../types/chess";
import { useChessComments } from "./useChessGame/useChessComments";
import { useTreeChessMoveManager } from "./useChessGame/treeChessMoveManager";
import { useTreeChessNavigation } from "./useChessGame/treeChessNavigation";
import { useChessTools } from "./useChessGame/useChessTools";

const createInitialState = (): ChessGameState => ({
  position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moveTree: [],
  currentPath: [],
  isFlipped: false,
  comments: new Map<string, string>(),
});

export const useChessGame = () => {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useState<ChessGameState>(() =>
    createInitialState(),
  );

  const {
    addComment,
    getComment,
    getCommentKey,
  } = useChessComments({ gameState, setGameState });

  const { makeMove, undoMove } = useTreeChessMoveManager({
    chessRef,
    gameState,
    setGameState,
    getCommentKey,
  });

  const navigation = useTreeChessNavigation({
    chessRef,
    gameState,
    setGameState,
  });

  const tools = useChessTools({
    chessRef,
    setGameState,
    createInitialState,
    setCurrentBranchContext: () => {}, // Not needed for tree structure
  });

  const helpers = useMemo(
    () => {
      const currentPath = gameState.currentPath;
      const isAtStart = currentPath.length === 0;
      const mainLineMoves = gameState.moveTree.length;
      const isAtEnd = currentPath.length === 1 && currentPath[0] === mainLineMoves - 1;
      
      return {
        canUndo: !isAtStart,
        canGoToPreviousMove: !isAtStart,
        canGoToNextMove: !isAtEnd, // Simplified - could be more sophisticated
      };
    },
    [gameState.currentPath, gameState.moveTree.length],
  );

  return {
    gameState,
    makeMove,
    undoMove,
    resetGame: tools.resetGame,
    flipBoard: tools.flipBoard,
    loadFEN: tools.loadFEN,
    loadPGN: tools.loadPGN,
    navigateToMove: navigation.navigateToMainLineMove,
    navigateToBranchMove: navigation.navigateToBranchMove,
    goToPreviousMove: navigation.goToPreviousMove,
    goToNextMove: navigation.goToNextMove,
    addComment,
    getComment,
    canUndo: helpers.canUndo,
    canGoToPreviousMove: helpers.canGoToPreviousMove,
    canGoToNextMove: helpers.canGoToNextMove,
    currentPath: gameState.currentPath, // Return path instead of branch context
  };
};
