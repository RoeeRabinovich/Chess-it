import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createStudySchema } from "../../../validations/createStudy.joi";
import { ChessGameState } from "../../../types/chess";
import { studyService } from "../../../services/studyService";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";
import { ToastAction } from "../../../components/ui/Toast";

interface FormData {
  studyName: string;
  category: "" | "Opening" | "Endgame" | "Strategy" | "Tactics";
  description: string;
  isPublic: boolean;
}

interface UseCreateStudyFormParams {
  isOpen: boolean;
  gameState: ChessGameState;
  onSuccess: () => void;
}

interface UseCreateStudyFormReturn {
  formData: FormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const useCreateStudyForm = ({
  isOpen,
  gameState,
  onSuccess,
}: UseCreateStudyFormParams): UseCreateStudyFormReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    studyName: "",
    category: "",
    description: "",
    isPublic: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        studyName: "",
        category: "",
        description: "",
        isPublic: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" || type === "radio"
          ? checked
          : name === "category"
            ? (value as typeof formData.category)
            : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const mainLineMoves = gameState.moveTree.map((node) => node.move);
    if (!mainLineMoves || mainLineMoves.length === 0) {
      toast({
        title: "Cannot Create Study",
        description: "Please add at least one move before creating a study.",
        variant: "destructive",
      });
      return;
    }

    const { error } = createStudySchema.validate(formData, {
      abortEarly: false,
    });

    if (error) {
      const validationErrors: Record<string, string> = {};
      error.details.forEach((detail) => {
        if (detail.path[0])
          validationErrors[detail.path[0] as string] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const commentsObject: Record<string, string> = {};
      if (gameState.comments) {
        if (gameState.comments instanceof Map) {
          gameState.comments.forEach((value, key) => {
            commentsObject[key] = value;
          });
        } else if (typeof gameState.comments === "object") {
          Object.assign(commentsObject, gameState.comments);
        }
      }

      const response = await studyService.createStudy({
        studyName: formData.studyName,
        category: formData.category as
          | "Opening"
          | "Endgame"
          | "Strategy"
          | "Tactics",
        description: formData.description,
        isPublic: formData.isPublic,
        gameState: {
          position: gameState.position,
          moveTree: gameState.moveTree,
          currentPath: gameState.currentPath,
          isFlipped: gameState.isFlipped,
          opening: gameState.opening,
          comments: commentsObject,
        },
      });

      onSuccess();
      toast({
        title: "Study Created Successfully!",
        description: `"${response.studyName}" has been saved.`,
        variant: "success",
        action: (
          <ToastAction
            altText="View Study"
            onClick={() => navigate(`/studies/${response.id}`)}
          >
            View Study
          </ToastAction>
        ),
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Failed to Create Study",
        description:
          apiError?.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
  };
};
