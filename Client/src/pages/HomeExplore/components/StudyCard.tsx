import { useNavigate } from "react-router-dom";
import { PublicStudy } from "../../../types/study";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import ChessBoard from "../../../components/ChessBoard/ChessBoard";

interface StudyCardProps {
  study: PublicStudy;
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

export const StudyCard = ({ study }: StudyCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/studies/${study._id}`);
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
      className="border-border cursor-pointer transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        {/* Chess Board Preview */}
        <div className="bg-muted flex items-center justify-center rounded-t-lg p-4">
          <div className="w-full max-w-[200px]">
            <ChessBoard
              position={fenPosition}
              isInteractive={false}
              boardScale={0.4}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        <CardTitle className="text-foreground font-minecraft text-lg">
          {study.studyName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="bg-accent text-foreground font-minecraft rounded px-2 py-1 text-xs">
            {study.category}
          </span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <span>❤️</span>
            <span>{study.likes}</span>
          </span>
        </div>
        {truncatedDescription && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {truncatedDescription}
          </p>
        )}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>by {study.createdBy?.username || "Unknown"}</span>
          <span>{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};
