import { useEffect, useState, useCallback } from "react";
import { apiService } from "../../../services/api";
import { studyService } from "../../../services/studyService";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";
import { Study } from "../../../types/study";

interface UseStudyLikesProps {
  id: string | undefined;
  study: Study | null;
}

interface UseStudyLikesReturn {
  isLiked: boolean;
  likesCount: number;
  isLiking: boolean;
  handleLike: () => Promise<void>;
  handleUnlike: () => Promise<void>;
}

export const useStudyLikes = ({
  id,
  study,
}: UseStudyLikesProps): UseStudyLikesReturn => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Check if study is liked and fetch likes count
  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!id || !apiService.isAuthenticated() || !study) return;

      try {
        const likedIds = await studyService.getLikedStudyIds();
        setIsLiked(likedIds.includes(id));
      } catch (err) {
        // Silently fail - user might not be authenticated
        console.error("Failed to check liked status:", err);
      }
    };

    if (study) {
      setLikesCount(study.likes || 0);
      checkLikedStatus();
    }
  }, [id, study]);

  // Handle like/unlike
  const handleLike = useCallback(async () => {
    if (!id || !apiService.isAuthenticated() || isLiking) return;

    setIsLiking(true);
    try {
      await studyService.likeStudy(id);
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      toast({
        title: "Study liked",
        description: "This study has been added to your archive.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError?.message || "Failed to like study. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  }, [id, isLiking, toast]);

  const handleUnlike = useCallback(async () => {
    if (!id || !apiService.isAuthenticated() || isLiking) return;

    setIsLiking(true);
    try {
      await studyService.unlikeStudy(id);
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      toast({
        title: "Study unliked",
        description: "This study has been removed from your archive.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError?.message || "Failed to unlike study. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  }, [id, isLiking, toast]);

  return {
    isLiked,
    likesCount,
    isLiking,
    handleLike,
    handleUnlike,
  };
};
