import { EngineLines } from "../../../components/EngineLines/EngineLines";
import { StudyMetadata } from "./StudyMetadata";
import { Button } from "../../../components/ui/Button";
import { Heart } from "lucide-react";
import { apiService } from "../../../services/api";
import { getMainLineMoves } from "../../../utils/moveTreeUtils";
import { MoveNode } from "../../../types/chess";

interface MobileTopSectionProps {
  studyName?: string;
  studyCategory?: string;
  studyDescription?: string;
  studyId?: string;
  isLiked?: boolean;
  likesCount?: number;
  isLiking?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
  isEngineEnabled: boolean;
  isAnalyzing: boolean;
  formattedEngineLines: Array<{
    sanNotation: string;
    evaluation: number;
    depth: number;
    possibleMate?: string | null;
  }>;
  moveTree: MoveNode[];
}

export const MobileTopSection = ({
  studyName,
  studyCategory,
  studyDescription,
  studyId,
  isLiked,
  likesCount,
  isLiking,
  onLike,
  onUnlike,
  isEngineEnabled,
  isAnalyzing,
  formattedEngineLines,
  moveTree,
}: MobileTopSectionProps) => {
  const isReviewMode = !!(studyName || studyCategory || studyDescription);

  if (isReviewMode) {
    return (
      <div className="border-border bg-card w-full max-w-screen border-b py-2 sm:py-3 ">
        <div className="mb-1.5 flex items-center gap-1.5 px-2 sm:px-3">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"></div>
          <span className="text-muted-foreground shrink-0 text-[10px] font-medium tracking-wide uppercase sm:text-xs">
            Study Info
          </span>
        </div>
        <StudyMetadata
          studyName={studyName}
          studyCategory={studyCategory}
          studyDescription={studyDescription}
        />
        {studyId && apiService.isAuthenticated() && (
          <div className="mt-3 px-2 sm:px-3">
            <Button
              variant="outline"
              size="sm"
              onClick={isLiked ? onUnlike : onLike}
              disabled={isLiking}
              className="w-full justify-center gap-2"
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-red-300 text-red-300" : ""
                }`}
              />
              <span className="font-minecraft text-xs sm:text-sm">
                {isLiked ? "Liked" : "Like"}
              </span>
              {likesCount !== undefined && likesCount > 0 && (
                <span className="text-xs sm:text-sm">({likesCount})</span>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (getMainLineMoves(moveTree).length === 0) {
    return null;
  }

  return (
    <div className="border-border bg-card w-full max-w-screen border-b py-1.5 sm:py-2">
      <div className="mb-1.5 flex items-center gap-1.5 px-2 sm:px-3">
        {isEngineEnabled && (
          <div
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${isAnalyzing ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
          ></div>
        )}
        <span className="text-muted-foreground shrink-0 text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          Engine Lines
        </span>
      </div>
      <div className="min-h-[50px] w-full max-w-screen overflow-hidden px-2 sm:min-h-[70px] sm:px-3">
        <div className="w-full max-w-full">
          <EngineLines
            lines={formattedEngineLines.slice(0, 2).map((line) => ({
              moves: line.sanNotation.split(" "),
              evaluation: line.evaluation,
              depth: line.depth,
              mate: line.possibleMate ? parseInt(line.possibleMate) : undefined,
            }))}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
};
