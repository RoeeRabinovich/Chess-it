import { useMemo, useRef, useState } from "react";

import { Chess } from "chess.js";

import type { ChessGameState } from "../types/chess";
import { useChessComments } from "./useChessGame/useChessComments";
import { useChessMoveManager } from "./useChessGame/useChessMoveManager";
import { useChessNavigation } from "./useChessGame/useChessNavigation";
import { useChessTools } from "./useChessGame/useChessTools";

const createInitialState = (): ChessGameState => ({
  position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moves: [],
  branches: [],
  currentMoveIndex: -1,
  isFlipped: false,
  comments: new Map<string, string>(),
});

export const useChessGame = () => {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useState<ChessGameState>(() =>
    createInitialState(),
  );

  const {
    currentBranchContext,
    setCurrentBranchContext,
    addComment,
    getComment,
    getCommentKey,
  } = useChessComments({ gameState, setGameState });

  const { makeMove, undoMove } = useChessMoveManager({
    chessRef,
    gameState,
    setGameState,
    getCommentKey,
    setCurrentBranchContext,
    currentBranchContext,
  });

  const navigation = useChessNavigation({
    chessRef,
    gameState,
    setGameState,
    setCurrentBranchContext,
  });

  const tools = useChessTools({
    chessRef,
    setGameState,
    createInitialState,
    setCurrentBranchContext,
  });

  const helpers = useMemo(
    () => ({
      canUndo: gameState.currentMoveIndex >= 0,
      canGoToPreviousMove: gameState.currentMoveIndex >= 0,
      canGoToNextMove: gameState.currentMoveIndex < gameState.moves.length - 1,
    }),
    [gameState.currentMoveIndex, gameState.moves.length],
  );

  return {
    gameState,
    makeMove,
    undoMove,
    resetGame: tools.resetGame,
    flipBoard: tools.flipBoard,
    loadFEN: tools.loadFEN,
    loadPGN: tools.loadPGN,
    navigateToMove: navigation.navigateToMove,
    navigateToBranchMove: navigation.navigateToBranchMove,
    goToPreviousMove: navigation.goToPreviousMove,
    goToNextMove: navigation.goToNextMove,
    addComment,
    getComment,
    canUndo: helpers.canUndo,
    canGoToPreviousMove: helpers.canGoToPreviousMove,
    canGoToNextMove: helpers.canGoToNextMove,
    currentBranchContext,
  };
};
