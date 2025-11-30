import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/ui/FormField";
import { Modal } from "../../../components/ui/Modal";
import { updateStudySchema } from "../../../validations/updateStudy.joi";
import { apiService } from "../../../services/api";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";
import { RightArrow } from "../../../components/icons/RightArrow.icon";
import { DescriptionTextarea, VisibilityRadio } from "../../CreateStudy/components/CreateStudyFormFields";
import { PublicStudy } from "../../../types/study";

interface EditStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: PublicStudy & { isPublic?: boolean };
  onUpdate: () => void;
}

export const EditStudyModal = ({
  isOpen,
  onClose,
  study,
  onUpdate,
}: EditStudyModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studyName: study.studyName || "",
    description: study.description || "",
    isPublic: study.isPublic ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when study changes
  useEffect(() => {
    if (study) {
      setFormData({
        studyName: study.studyName || "",
        description: study.description || "",
        isPublic: study.isPublic ?? true,
      });
    }
  }, [study]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Validate with Joi
    const { error } = updateStudySchema.validate(formData, {
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
      await apiService.updateStudy(study._id, {
        studyName: formData.studyName,
        description: formData.description,
        isPublic: formData.isPublic,
      });

      onClose();
      onUpdate();
      toast({
        title: "Study Updated Successfully!",
        description: `"${formData.studyName}" has been updated.`,
        variant: "success",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Failed to Update Study",
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
      title="Edit Study"
      titleId="edit-study-modal-title"
      closeLabel="Close modal"
      preventBackdropClose={isSubmitting}
      closeButtonDisabled={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Study Name"
          error={errors.studyName}
          required
        >
          <Input
            name="studyName"
            value={formData.studyName}
            onChange={handleChange}
            placeholder="Enter study name"
            disabled={isSubmitting}
          />
        </FormField>

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
            className="group flex-1 bg-pastel-mint text-foreground hover:bg-pastel-mint/80 dark:!text-[#1A1A1A]"
          >
            {isSubmitting ? "Updating..." : "Update Study"}
            <RightArrow className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};

