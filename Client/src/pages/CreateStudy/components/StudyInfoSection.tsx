import { Button } from "../../../components/ui/Button";
import { Heart } from "lucide-react";
import { StudyMetadata } from "./StudyMetadata";
import { SectionHeader } from "./SectionHeader";
import { apiService } from "../../../services/api";

interface StudyInfoSectionProps {
  studyName?: string;
  studyCategory?: string;
  studyDescription?: string;
  studyId?: string;
  isLiked?: boolean;
  isLiking?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
}

export const StudyInfoSection = ({
  studyName,
  studyCategory,
  studyDescription,
  studyId,
  isLiked,
  isLiking,
  onLike,
  onUnlike,
}: StudyInfoSectionProps) => {
  if (!studyName && !studyCategory && !studyDescription) {
    return null;
  }

  return (
    <>
      <SectionHeader title="Study Info" />
      <div className="mb-2 sm:mb-3 lg:mb-4">
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
            </Button>
          </div>
        )}
      </div>
      <hr className="border-border/30 my-1.5 sm:my-2 lg:my-4" />
    </>
  );
};

