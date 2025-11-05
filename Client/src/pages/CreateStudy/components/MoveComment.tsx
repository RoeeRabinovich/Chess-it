import { useState, useEffect } from "react";
import { Comment } from "../../../components/icons/Comment.icon";

interface MoveCommentProps {
  currentMoveComment: string;
  onSaveComment: (comment: string) => void;
  canComment: boolean; // Whether we're on a valid move (currentMoveIndex >= 0)
}

export const MoveComment = ({
  currentMoveComment,
  onSaveComment,
  canComment,
}: MoveCommentProps) => {
  const [commentText, setCommentText] = useState(currentMoveComment);

  // Update textarea when currentMoveComment changes (when navigating between moves)
  useEffect(() => {
    setCommentText(currentMoveComment);
  }, [currentMoveComment]);

  const handleSave = () => {
    onSaveComment(commentText);
  };

  if (!canComment) {
    return null; // Don't show comment section for initial position
  }

  return (
    <div className="border-border bg-card w-full flex-shrink-0 border-t px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Comment className="h-3 w-3 text-purple-500 sm:h-3.5 sm:w-3.5" />
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
          Move Comment
        </span>
      </div>
      <div className="space-y-2">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a note for this move..."
          className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-md border px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary sm:text-xs"
          rows={3}
          maxLength={1000}
        />
        <button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors sm:text-xs"
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

