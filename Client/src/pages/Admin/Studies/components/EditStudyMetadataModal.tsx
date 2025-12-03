import { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { FormField } from "../../../../components/ui/FormField";
import { cn } from "../../../../lib/utils";
import { Study } from "../../../../types/study";

interface EditStudyMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: Study | null;
  onSave: (
    studyId: string,
    data: {
      studyName: string;
      category: "Opening" | "Endgame" | "Strategy" | "Tactics";
      description: string;
      isPublic: boolean;
    },
  ) => Promise<void>;
}

export const EditStudyMetadataModal = ({
  isOpen,
  onClose,
  study,
  onSave,
}: EditStudyMetadataModalProps) => {
  const [studyName, setStudyName] = useState("");
  const [category, setCategory] = useState<
    "Opening" | "Endgame" | "Strategy" | "Tactics"
  >("Opening");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (study) {
      setStudyName(study.studyName);
      setCategory(study.category);
      setDescription(study.description || "");
      setIsPublic(study.isPublic ?? false);
      setError(null);
    }
  }, [study, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;

    if (!studyName.trim()) {
      setError("Study name is required");
      return;
    }

    if (studyName.trim().length < 8 || studyName.trim().length > 52) {
      setError("Study name must be between 8 and 52 characters");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(study._id, {
        studyName: studyName.trim(),
        category,
        description: description.trim(),
        isPublic: isPublic,
      });
      onClose();
    } catch (err) {
      const error = err as { message?: string };
      setError(error?.message || "Failed to update study");
    } finally {
      setIsSaving(false);
    }
  };

  if (!study) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Study Metadata"
      titleId="edit-study-metadata-modal"
      maxWidth="lg"
      preventBackdropClose={isSaving}
      closeButtonDisabled={isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <FormField
          label="Study Name"
          required
          error={error && error.includes("name") ? error : undefined}
          hint="Must be between 8 and 52 characters"
        >
          <Input
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            placeholder="Enter study name"
            minLength={8}
            maxLength={52}
            disabled={isSaving}
          />
        </FormField>

        <FormField label="Category" required>
          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as
                  | "Opening"
                  | "Endgame"
                  | "Strategy"
                  | "Tactics",
              )
            }
            disabled={isSaving}
            className={cn(
              "border-input bg-background font-minecraft h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
              "hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--ring))]",
              "transition-all duration-200 ease-in-out",
            )}
          >
            <option value="Opening">Opening</option>
            <option value="Endgame">Endgame</option>
            <option value="Strategy">Strategy</option>
            <option value="Tactics">Tactics</option>
          </select>
        </FormField>

        <FormField
          label="Description"
          hint="Optional description for your study"
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter study description (optional)"
            rows={4}
            disabled={isSaving}
            className={cn(
              "border-input bg-background font-minecraft w-full resize-none rounded-none border-2 border-solid px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
              "hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--ring))]",
              "transition-all duration-200 ease-in-out",
            )}
          />
        </FormField>

        <FormField label="Visibility" required>
          <select
            value={isPublic ? "true" : "false"}
            onChange={(e) => setIsPublic(e.target.value === "true")}
            disabled={isSaving}
            className={cn(
              "border-input bg-background font-minecraft h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
              "hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--ring))]",
              "transition-all duration-200 ease-in-out",
            )}
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </FormField>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
