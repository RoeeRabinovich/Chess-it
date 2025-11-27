import { Badge } from "../../../components/ui/Badge";

interface StudyMetadataProps {
  studyName?: string;
  studyCategory?: string;
  studyDescription?: string;
}

/**
 * Component to display study metadata (name, category, description)
 * Used in review mode to replace engine lines section
 */
export const StudyMetadata = ({
  studyName,
  studyCategory,
  studyDescription,
}: StudyMetadataProps) => {
  if (!studyName && !studyCategory && !studyDescription) {
    return null;
  }

  return (
    <div className="space-y-2 px-2 sm:px-3">
      {studyName && (
        <div>
          <h2 className="text-foreground font-minecraft text-base font-bold sm:text-lg">
            {studyName}
          </h2>
        </div>
      )}
      {studyCategory && (
        <div>
          <Badge variant="outline" size="sm">
            {studyCategory}
          </Badge>
        </div>
      )}
      {studyDescription && (
        <div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {studyDescription}
          </p>
        </div>
      )}
    </div>
  );
};

