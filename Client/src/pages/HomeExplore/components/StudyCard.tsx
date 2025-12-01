import { useNavigate } from "react-router-dom";
import { Study } from "../../../types/study";
import { Card, CardContent, CardTitle } from "../../../components/ui/Card";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";
import { Button } from "../../../components/ui/Button";
import { Trash } from "../../../components/icons/Trash.icon";
import { Edit } from "../../../components/icons/Edit.icon";
import { Badge } from "../../../components/ui/Badge";
import { Tooltip } from "../../../components/ui/Tooltip";

interface StudyCardProps {
  study: Study;
  onDelete?: (studyId: string) => void;
  onEdit?: (studyId: string) => void;
}

// Helper function to format date as "X time ago"
const formatDateAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export const StudyCard = ({ study, onDelete, onEdit }: StudyCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/studies/${study._id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(study._id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onEdit) {
      onEdit(study._id);
    }
  };

  // Get the last FEN position from gameState
  const fenPosition =
    study.gameState?.position ||
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  // Format date
  const formattedDate = formatDateAgo(study.createdAt);

  // Truncate description
  const truncatedDescription =
    study.description.length > 100
      ? `${study.description.substring(0, 100)}...`
      : study.description;

  return (
    <Card
      className="border-border relative cursor-pointer transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      {(onDelete || onEdit) && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {onEdit && (
            <Tooltip content="Edit study" side="left">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleEdit}
                className="h-8 w-8"
                aria-label="Edit study"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip content="Delete study" side="left">
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8"
                aria-label="Delete study"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      )}
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch">
        <div className="flex flex-shrink-0 justify-center sm:w-auto">
          <div className="border-border bg-muted flex h-[155px] w-[155px] items-center justify-center overflow-hidden rounded-lg border p-1.5">
            <ChessBoard
              position={fenPosition}
              isInteractive={false}
              boardScale={0.28}
              showNotation={false}
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:pl-3">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-foreground font-minecraft text-lg">
              {study.studyName}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip
                content={`${study.category} studies focus on ${study.category.toLowerCase()} concepts`}
                side="top"
              >
                <Badge variant="outline" size="sm">
                  {study.category}
                </Badge>
              </Tooltip>
              {study.isPublic !== undefined && (
                <Tooltip
                  content={
                    study.isPublic
                      ? "Visible to everyone"
                      : "Only visible to you"
                  }
                  side="top"
                >
                  <Badge
                    variant={study.isPublic ? "default" : "secondary"}
                    size="sm"
                  >
                    {study.isPublic ? "Public" : "Private"}
                  </Badge>
                </Tooltip>
              )}
            </div>
            {truncatedDescription && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {truncatedDescription}
              </p>
            )}
          </div>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>by {study.createdBy?.username || "Unknown"}</span>
            <div className="flex items-center gap-3">
              <Tooltip
                content={`${study.likes} ${study.likes === 1 ? "user likes" : "users like"} this study`}
                side="top"
              >
                <span className="flex cursor-default items-center gap-1">
                  <span>❤️</span>
                  <span>{study.likes}</span>
                </span>
              </Tooltip>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
