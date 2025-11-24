import { useEffect, useState } from "react";
import { PublicStudy } from "../../types/study";
import { apiService } from "../../services/api";
import { ApiError } from "../../types/auth";
import { StudyCard } from "../HomeExplore/components/StudyCard";
import { useToast } from "../../hooks/useToast";

export const MyStudies = () => {
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getUserStudies();
        setStudies(data);
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError?.message || "Failed to load your studies. Please try again.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [toast]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="bg-muted border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-2 text-lg font-semibold">
                Error loading studies
              </p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground font-minecraft mb-2 text-3xl font-bold">
            My Studies
          </h1>
          <p className="text-muted-foreground text-sm">
            {studies.length === 0
              ? "You haven't created any studies yet."
              : `You have ${studies.length} ${studies.length === 1 ? "study" : "studies"}.`}
          </p>
        </div>

        {/* Studies Grid */}
        {studies.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No studies found. Create your first study to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {studies.map((study) => (
              <StudyCard key={study._id} study={study} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
