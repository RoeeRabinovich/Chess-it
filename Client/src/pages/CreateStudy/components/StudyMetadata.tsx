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
          <span className="bg-accent text-foreground font-minecraft inline-block rounded px-2 py-1 text-xs">
            {studyCategory}
          </span>
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

