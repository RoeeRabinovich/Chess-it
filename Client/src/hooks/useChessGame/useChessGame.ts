import { useMemo, useRef, useState } from "react";

import { Chess } from "chess.js";

import type { ChessGameState } from "../../types/chess";
import { useChessComments } from "./useChessComments";
import { useTreeChessMoveManager } from "./treeChessMoveManager";
import { useTreeChessNavigation } from "./treeChessNavigation";
import { useChessTools } from "./useChessTools";

const createInitialState = (): ChessGameState => ({
  position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moveTree: [],
  rootBranches: [],
  startingPosition: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  currentPath: [],
  isFlipped: false,
  comments: new Map<string, string>(),
});

export const useChessGame = () => {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useState<ChessGameState>(() =>
    createInitialState(),
  );

  const { addComment, getComment, getCommentKey } = useChessComments({
    gameState,
    setGameState,
  });

  const { makeMove } = useTreeChessMoveManager({
    chessRef,
    gameState,
    setGameState,
  });

  const navigation = useTreeChessNavigation({
    chessRef,
    gameState,
    setGameState,
    startingPosition: gameState.startingPosition,
  });

  const tools = useChessTools({
    chessRef,
    gameState,
    setGameState,
    createInitialState,
    getCommentKey,
  });

  const helpers = useMemo(() => {
    const currentPath = gameState.currentPath;
    const isAtStart = currentPath.length === 0;
    const mainLineMoves = gameState.moveTree.length;
    const isAtEnd =
      currentPath.length === 1 && currentPath[0] === mainLineMoves - 1;

    return {
      canUndo: !isAtStart,
      canGoToPreviousMove: !isAtStart,
      canGoToNextMove: !isAtEnd,
    };
  }, [gameState.currentPath, gameState.moveTree.length]);

  return {
    gameState,
    makeMove,
    undoMove: tools.undoMove,
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
