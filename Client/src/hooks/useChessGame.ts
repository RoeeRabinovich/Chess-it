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
    comments: new Map<string, string>(),
  });

  // Track current branch context for comments
  const [currentBranchContext, setCurrentBranchContext] = useState<{
    branchId: string;
    moveIndexInBranch: number;
  } | null>(null);

  // Helper to generate comment key
  const getCommentKey = useCallback(
    (moveIndex: number, branchId?: string, moveIndexInBranch?: number): string => {
      if (branchId !== undefined && moveIndexInBranch !== undefined) {
        return `branch-${branchId}-${moveIndexInBranch}`;
      }
      return `main-${moveIndex}`;
    },
    [],
  );

  const makeMove = useCallback(
    (move: MoveData | ChessMove) => {
      try {
        // Extract only the necessary properties for making a move
        const moveData: MoveData = {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        };

        // Check if we're at the end of the main line
        const isAtEndOfMainLine =
          gameState.currentMoveIndex === gameState.moves.length - 1;

        // If we're not at the end, we're creating a branch
        if (!isAtEndOfMainLine) {
          // First, ensure chess instance is at the branch point
          // Load the position directly from gameState to ensure sync
          try {
            chessRef.current.load(gameState.position);
          } catch (error) {
            // If loading position fails, replay moves as fallback
            console.error("Error loading position:", error);
            chessRef.current.reset();
            const movesToBranchPoint = gameState.moves.slice(
              0,
              gameState.currentMoveIndex + 1,
            );
            for (const m of movesToBranchPoint) {
              const moveResult = chessRef.current.move({
                from: m.from,
                to: m.to,
                promotion: m.promotion,
              });
              if (!moveResult) {
                // If replay fails, reset and exit
                chessRef.current.reset();
                return false;
              }
            }
          }

          // Find existing branch at this position
          // Branch starts at currentMoveIndex + 1 (the next move after currentMoveIndex)
          const existingBranch = gameState.branches.find(
            (b) => b.startIndex === gameState.currentMoveIndex + 1,
          );

          const result = chessRef.current.move(moveData);
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
                // Don't increment currentMoveIndex - we're in a branch, not main line
              }));
            } else {
              // Create new branch
              // startIndex should be currentMoveIndex + 1 because the branch is an alternative
              // to the NEXT move after currentMoveIndex
              const branchId = `branch-${gameState.currentMoveIndex}-${Date.now()}`;
              const newBranch: MoveBranch = {
                id: branchId,
                parentMoveIndex: gameState.currentMoveIndex,
                moves: [newMove],
                startIndex: gameState.currentMoveIndex + 1,
              };

              setGameState((prev) => ({
                ...prev,
                position: chessRef.current.fen(),
                branches: [...prev.branches, newBranch],
                // Don't increment currentMoveIndex - we're in a branch, not main line
              }));
            }

            return true;
          }
          return false;
        } else {
          // Normal move at the end of main line
          const result = chessRef.current.move(moveData);
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
    },
    [gameState],
  );

  const undoMove = useCallback(() => {
    try {
      const move = chessRef.current.undo();
      if (move) {
        setGameState((prev) => {
          const newMoves = prev.moves.slice(0, -1);
          const newCurrentIndex = Math.max(-1, prev.currentMoveIndex - 1);
          
          // Delete comment for the undone move
          const commentKey = getCommentKey(prev.moves.length - 1);
          const newComments = new Map(prev.comments || new Map());
          newComments.delete(commentKey);
          
          // Also clear branch context if we're undoing back to main line
          if (newCurrentIndex < prev.moves.length - 1) {
            setCurrentBranchContext(null);
          }
          
          return {
            ...prev,
            position: chessRef.current.fen(),
            moves: newMoves,
            currentMoveIndex: newCurrentIndex,
            comments: newComments,
          };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Cannot undo:", error);
      return false;
    }
  }, [getCommentKey]);

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
      comments: new Map<string, string>(),
    });
    setCurrentBranchContext(null);
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
        comments: new Map<string, string>(),
      }));
      setCurrentBranchContext(null);
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
        comments: new Map<string, string>(),
      }));
      setCurrentBranchContext(null);
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
        // Clear branch context when navigating to main line
        setCurrentBranchContext(null);
      } catch (error) {
        console.error("Error navigating to move:", error);
      }
    },
    [gameState.moves],
  );

  const navigateToBranchMove = useCallback(
    (branchId: string, moveIndexInBranch: number) => {
      try {
        const branch = gameState.branches.find((b) => b.id === branchId);
        if (!branch) return;

        // Replay main line up to (but not including) branch point
        // branch.startIndex is where the branch starts, so we need moves up to that point
        chessRef.current.reset();
        const movesToBranchPoint = gameState.moves.slice(0, branch.startIndex);

        for (const move of movesToBranchPoint) {
          const result = chessRef.current.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
          if (!result) {
            throw new Error(`Failed to replay main line move: ${move.san}`);
          }
        }

        // Replay branch moves up to the specified index
        const branchMovesToReplay = branch.moves.slice(
          0,
          moveIndexInBranch + 1,
        );
        for (const move of branchMovesToReplay) {
          const result = chessRef.current.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
          if (!result) {
            throw new Error(`Failed to replay branch move: ${move.san}`);
          }
        }

        setGameState((prev) => ({
          ...prev,
          position: chessRef.current.fen(),
          currentMoveIndex: branch.startIndex - 1, // Position before branch starts
        }));
        // Set branch context for comments
        setCurrentBranchContext({ branchId, moveIndexInBranch });
      } catch (error) {
        console.error("Error navigating to branch move:", error);
      }
    },
    [gameState.moves, gameState.branches],
  );

  const goToPreviousMove = useCallback(() => {
    if (gameState.currentMoveIndex >= 0) {
      navigateToMove(gameState.currentMoveIndex - 1);
    }
  }, [gameState.currentMoveIndex, navigateToMove]);

  const goToNextMove = useCallback(() => {
    if (gameState.currentMoveIndex < gameState.moves.length - 1) {
      navigateToMove(gameState.currentMoveIndex + 1);
    }
  }, [gameState.currentMoveIndex, gameState.moves.length, navigateToMove]);

  // Comment management functions
  const addComment = useCallback(
    (comment: string) => {
      setGameState((prev) => {
        const newComments = new Map(prev.comments || new Map());
        
        // Determine comment key based on current context
        let commentKey: string;
        if (currentBranchContext) {
          // Branch move: use branch context
          commentKey = getCommentKey(
            0, // Not used for branch moves
            currentBranchContext.branchId,
            currentBranchContext.moveIndexInBranch,
          );
        } else {
          // Main line move: use currentMoveIndex
          commentKey = getCommentKey(prev.currentMoveIndex);
        }
        
        if (comment.trim() === "") {
          newComments.delete(commentKey);
        } else {
          newComments.set(commentKey, comment);
        }
        
        return {
          ...prev,
          comments: newComments,
        };
      });
    },
    [currentBranchContext, getCommentKey],
  );

  const getComment = useCallback((): string => {
    if (gameState.currentMoveIndex < 0 && !currentBranchContext) {
      return ""; // No comments for initial position
    }
    
    const comments = gameState.comments || new Map();
    let commentKey: string;
    
    if (currentBranchContext) {
      // Branch move: use branch context
      commentKey = getCommentKey(
        0, // Not used for branch moves
        currentBranchContext.branchId,
        currentBranchContext.moveIndexInBranch,
      );
    } else {
      // Main line move: use currentMoveIndex
      commentKey = getCommentKey(gameState.currentMoveIndex);
    }
    
    return comments.get(commentKey) || "";
  }, [gameState.currentMoveIndex, gameState.comments, currentBranchContext, getCommentKey]);

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
    navigateToBranchMove,
    goToPreviousMove,
    goToNextMove,
    canUndo: gameState.currentMoveIndex >= 0,
    canRedo: false,
    canGoToPreviousMove: gameState.currentMoveIndex >= 0,
    canGoToNextMove: gameState.currentMoveIndex < gameState.moves.length - 1,
    addComment,
    getComment,
  };
};
