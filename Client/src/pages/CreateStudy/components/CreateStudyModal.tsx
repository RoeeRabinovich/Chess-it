import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { createStudySchema } from "../../../validations/createStudy.joi";
import { ChessGameState } from "../../../types/chess";
import { apiService } from "../../../services/api";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "../../../components/ui/Toast";

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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset form when modal closes
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

    // Clear error for this field when user starts typing
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

    // Validate with Joi
    const { error } = createStudySchema.validate(formData, {
      abortEarly: false,
    });

    if (error) {
      const validationErrors: Record<string, string> = {};
      error.details.forEach((detail) => {
        if (detail.path[0]) {
          validationErrors[detail.path[0] as string] = detail.message;
        }
      });
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.createStudy({
        studyName: formData.studyName,
        category: formData.category as "Opening" | "Endgame" | "Strategy" | "Tactics",
        description: formData.description,
        isPublic: formData.isPublic,
        gameState,
      });

      // Close modal
      onClose();

      // Show success toast with View Study button
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className="border-border bg-secondary fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-study-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="create-study-modal-title"
            className="text-lg font-semibold"
          >
            Create Study
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Study Name */}
          <Input
            label="Study Name"
            name="studyName"
            id="studyName"
            value={formData.studyName}
            onChange={handleChange}
            error={errors.studyName}
            required
            placeholder="Enter study name (8-24 characters)"
            disabled={isSubmitting}
          />

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-foreground block text-sm font-medium"
            >
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`border-border bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.category
                  ? "border-destructive focus:border-destructive focus:ring-destructive"
                  : ""
              }`}
            >
              <option value="">Select a category</option>
              <option value="Opening">Opening</option>
              <option value="Endgame">Endgame</option>
              <option value="Strategy">Strategy</option>
              <option value="Tactics">Tactics</option>
            </select>
            {errors.category && (
              <p className="text-destructive font-minecraft flex items-center gap-1 text-xs">
                <span className="text-destructive">⚠</span>
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-foreground block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
              placeholder="Optional description for your study..."
              className="border-border bg-background placeholder:text-muted-foreground w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Public/Private Radio Buttons */}
          <div className="space-y-2">
            <label className="text-foreground block text-sm font-medium">
              Visibility <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isPublic"
                  value="true"
                  checked={formData.isPublic === true}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublic: true,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isPublic"
                  value="false"
                  checked={formData.isPublic === false}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublic: false,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm">Private</span>
              </label>
            </div>
            {errors.isPublic && (
              <p className="text-destructive font-minecraft flex items-center gap-1 text-xs">
                <span className="text-destructive">⚠</span>
                {errors.isPublic}
              </p>
            )}
          </div>

          {/* Submit Button */}
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Study"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

