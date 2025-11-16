import { useParams } from "react-router-dom";

export const ReviewStudy = () => {
  const { id } = useParams<{ id: string }>();

  // Basic structure - will be implemented in later steps
  return (
    <div className="bg-background flex h-screen overflow-hidden pt-16 sm:pt-20 md:pt-24">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-2xl font-bold">
            Review Study
          </h1>
          <p className="text-muted-foreground">
            Study ID: {id || "Not found"}
          </p>
        </div>
      </div>
    </div>
  );
};

