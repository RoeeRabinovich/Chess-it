import { TreeMoveNotation } from "../../../components/MoveNotation/TreeMoveNotation";
import { MoveNode, MovePath } from "../../../types/chess";

interface MobileMoveHistoryProps {
  moveTree: MoveNode[];
  rootBranches: MoveNode[][];
  currentPath: MovePath;
  onMoveClick: (path: MovePath) => void;
  opening?: { name: string; eco: string };
  comments?: Map<string, string>;
}

export const MobileMoveHistory = ({
  moveTree,
  rootBranches,
  currentPath,
  onMoveClick,
  opening,
  comments,
}: MobileMoveHistoryProps) => {
  return (
    <div className="border-border bg-card w-full flex-shrink-0 border-t px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          Move History
        </span>
      </div>
      <div className="max-h-[150px] overflow-y-auto sm:max-h-[200px]">
        <TreeMoveNotation
          moveTree={moveTree}
          rootBranches={rootBranches}
          currentPath={currentPath}
          onMoveClick={onMoveClick}
          opening={opening}
          comments={comments}
        />
      </div>
    </div>
  );
};
