import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/ui/FormField";
import { Modal } from "../../../components/ui/Modal";
import { createStudySchema } from "../../../validations/createStudy.joi";
import { ChessGameState } from "../../../types/chess";
import { apiService } from "../../../services/api";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "../../../components/ui/Toast";
import { RightArrow } from "../../../components/icons/RightArrow.icon";
import {
  CategorySelect,
  DescriptionTextarea,
  VisibilityRadio,
} from "./CreateStudyFormFields";

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: ChessGameState;
}

export const CreateStudyModal = ({
  isOpen,
  onClose,
  gameState,
}: CreateStudyModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studyName: "",
    category: "" as "" | "Opening" | "Endgame" | "Strategy" | "Tactics",
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

    // Check if study has any moves
    const mainLineMoves = gameState.moveTree.map((node) => node.move);
    if (!mainLineMoves || mainLineMoves.length === 0) {
      toast({
        title: "Cannot Create Study",
        description: "Please add at least one move before creating a study.",
        variant: "destructive",
      });
      return;
    }

    // Validate with Joi
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
      // Convert comments Map to object for API
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

      const response = await apiService.createStudy({
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

      onClose();
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Study"
      titleId="create-study-modal-title"
      closeLabel="Close modal"
      preventBackdropClose={isSubmitting}
      closeButtonDisabled={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Study Name" error={errors.studyName} required>
          <Input
            name="studyName"
            value={formData.studyName}
            onChange={handleChange}
            placeholder="Enter study name"
            disabled={isSubmitting}
          />
        </FormField>

        <CategorySelect
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          disabled={isSubmitting}
        />

        <DescriptionTextarea
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <VisibilityRadio
          value={formData.isPublic}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, isPublic: value }))
          }
          error={errors.isPublic}
          disabled={isSubmitting}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="group bg-pastel-mint text-foreground hover:bg-pastel-mint/80 flex-1 dark:!text-[#1A1A1A]"
          >
            {isSubmitting ? "Creating..." : "Create Study"}
            <RightArrow className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};
