import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/ui/FormField";
import { Modal } from "../../../components/ui/Modal";
import { ChessGameState } from "../../../types/chess";
import { RightArrow } from "../../../components/icons/RightArrow.icon";
import {
  CategorySelect,
  DescriptionTextarea,
  VisibilityRadio,
} from "./CreateStudyFormFields";
import { useCreateStudyForm } from "./useCreateStudyForm";

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
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
  } = useCreateStudyForm({
    isOpen,
    gameState,
    onSuccess: onClose,
  });

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
