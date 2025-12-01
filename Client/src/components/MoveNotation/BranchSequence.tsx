import type { MoveNode, MovePath } from "../../types/chess";
import { MoveButton } from "./MoveButton";
import { MoveNumberLabel } from "./MoveNumberLabel";
import {
  pathToString,
  getAbsoluteMoveIndex,
} from "../../utils/moveTreeUtils";

interface BranchSequenceProps {
  branchSequence: MoveNode[];
  basePath: MovePath;
  currentPath: MovePath;
  onMoveClick: (path: MovePath) => void;
  comments: Map<string, string>;
  depth?: number;
  moveTree: MoveNode[];
}

/**
 * Helper function to render nested branches inline
 */
const renderNestedBranches = (
  branches: MoveNode[][],
  movePath: MovePath,
  currentPath: MovePath,
  onMoveClick: (path: MovePath) => void,
  comments: Map<string, string>,
  moveTree: MoveNode[],
  isAlreadyInParens = false,
) => {
  if (branches.length === 0) return null;

  return (
    <>
      {branches.map((nestedBranch, branchIdx) => {
        const nestedBasePath: MovePath = [...movePath, branchIdx];
        const shouldWrapInParens = !isAlreadyInParens;

        const nestedContent = (
          <span className="inline-flex items-center gap-0.5 sm:gap-1">
            {nestedBranch.map((nestedNode, nestedMoveIdx) => {
              const nestedMovePath: MovePath = [
                ...nestedBasePath,
                nestedMoveIdx,
              ];
              const nestedAbsoluteIndex = getAbsoluteMoveIndex(
                moveTree,
                nestedMovePath,
              );

              if (nestedAbsoluteIndex < 0) return null;

              const nestedIsBlackMove = nestedAbsoluteIndex % 2 === 1;
              const nestedMoveNumber =
                Math.floor(nestedAbsoluteIndex / 2) + 1;
              const nestedIsFirstMove = nestedMoveIdx === 0;
              const nestedIsActive =
                pathToString(nestedMovePath) === pathToString(currentPath);
              const nestedHasComment = comments.has(
                pathToString(nestedMovePath),
              );

              return (
                <span
                  key={nestedMoveIdx}
                  className="flex items-center gap-0.5 sm:gap-1"
                >
                  <MoveNumberLabel
                    moveNumber={nestedMoveNumber}
                    isFirstMove={nestedIsFirstMove}
                    isBlackMove={nestedIsBlackMove}
                  />
                  <MoveButton
                    move={nestedNode.move.san}
                    isActive={nestedIsActive}
                    hasComment={nestedHasComment}
                    onClick={() => onMoveClick(nestedMovePath)}
                    size="sm"
                  />
                  {nestedNode.branches.length > 0 &&
                    renderNestedBranches(
                      nestedNode.branches,
                      nestedMovePath,
                      currentPath,
                      onMoveClick,
                      comments,
                      moveTree,
                      true,
                    )}
                </span>
              );
            })}
          </span>
        );

        return shouldWrapInParens ? (
          <span
            key={`${nestedBasePath.join("-")}`}
            className="inline-flex items-center"
          >
            <span className="text-muted-foreground mx-0.5">(</span>
            {nestedContent}
            <span className="text-muted-foreground mx-0.5">)</span>
          </span>
        ) : (
          <span key={`${nestedBasePath.join("-")}`}>{nestedContent}</span>
        );
      })}
    </>
  );
};

/**
 * Recursively renders a branch sequence
 */
export const BranchSequence = ({
  branchSequence,
  basePath,
  currentPath,
  onMoveClick,
  comments,
  depth = 0,
  moveTree,
}: BranchSequenceProps) => {
  if (branchSequence.length === 0) return null;

  const marginClass = depth === 0 ? "ml-4" : depth === 1 ? "ml-8" : "ml-12";

  return (
    <div
      className={`${marginClass} flex flex-wrap items-center gap-0.5 sm:gap-1`}
    >
      {branchSequence.map((node, moveIdx) => {
        const movePath: MovePath = [...basePath, moveIdx];
        const absoluteIndex = getAbsoluteMoveIndex(moveTree, movePath);

        if (absoluteIndex < 0) {
          return null;
        }

        const isBlackMove = absoluteIndex % 2 === 1;
        const moveNumber = Math.floor(absoluteIndex / 2) + 1;
        const isFirstMove = moveIdx === 0;
        const isActive = pathToString(movePath) === pathToString(currentPath);
        const hasComment = comments.has(pathToString(movePath));

        return (
          <span key={moveIdx} className="flex items-center gap-0.5 sm:gap-1">
            <MoveNumberLabel
              moveNumber={moveNumber}
              isFirstMove={isFirstMove}
              isBlackMove={isBlackMove}
            />
            <MoveButton
              move={node.move.san}
              isActive={isActive}
              hasComment={hasComment}
              onClick={() => onMoveClick(movePath)}
              size="sm"
            />
            {node.branches.length > 0 &&
              renderNestedBranches(
                node.branches,
                movePath,
                currentPath,
                onMoveClick,
                comments,
                moveTree,
              )}
          </span>
        );
      })}
    </div>
  );
};

