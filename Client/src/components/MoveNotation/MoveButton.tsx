import { Comment } from "../icons/Comment.icon";

interface MoveButtonProps {
  move: string;
  isActive: boolean;
  hasComment: boolean;
  onClick: () => void;
  onRef?: (el: HTMLButtonElement | null) => void;
  size?: "sm" | "md" | "lg";
}

export const MoveButton = ({
  move,
  isActive,
  hasComment,
  onClick,
  onRef,
  size = "md",
}: MoveButtonProps) => {
  const sizeClasses = {
    sm: "px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs",
    md: "px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs lg:px-2 lg:text-sm",
    lg: "px-2 py-1 text-sm sm:text-base",
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        ref={onRef}
        onClick={onClick}
        className={`rounded transition-colors ${sizeClasses[size]} ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted"
        }`}
      >
        {move}
      </button>
      {hasComment && (
        <Comment className="h-2.5 w-2.5 text-purple-500 sm:h-3 sm:w-3" />
      )}
    </div>
  );
};
