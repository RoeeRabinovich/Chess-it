import { FormField } from "../../../components/ui/FormField";
import { cn } from "../../../lib/utils";

interface CategorySelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled: boolean;
}

export const CategorySelect = ({
  value,
  onChange,
  error,
  disabled,
}: CategorySelectProps) => {
  return (
    <FormField label="Category" error={error} required>
      <select
        name="category"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "border-input bg-background font-minecraft h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
          "hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
          "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--ring))]",
          error &&
            "border-destructive shadow-[2px_2px_0px_0px_hsl(var(--destructive))]",
          error &&
            "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--destructive))]",
          "transition-all duration-200 ease-in-out",
        )}
      >
        <option value="">Select a category</option>
        <option value="Opening">Opening</option>
        <option value="Endgame">Endgame</option>
        <option value="Strategy">Strategy</option>
        <option value="Tactics">Tactics</option>
      </select>
    </FormField>
  );
};

interface DescriptionTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export const DescriptionTextarea = ({
  value,
  onChange,
  disabled,
}: DescriptionTextareaProps) => {
  return (
    <FormField
      label="Description"
      hint="Optional description for your study"
    >
      <textarea
        name="description"
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={3}
        placeholder="Optional description for your study..."
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
  );
};

interface VisibilityRadioProps {
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled: boolean;
}

export const VisibilityRadio = ({
  value,
  onChange,
  error,
  disabled,
}: VisibilityRadioProps) => {
  return (
    <FormField label="Visibility" error={error} required>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="isPublic"
            checked={value === true}
            onChange={() => onChange(true)}
            disabled={disabled}
            className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm font-minecraft">Public</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="isPublic"
            checked={value === false}
            onChange={() => onChange(false)}
            disabled={disabled}
            className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm font-minecraft">Private</span>
        </label>
      </div>
    </FormField>
  );
};
